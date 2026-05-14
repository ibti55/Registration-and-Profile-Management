import { Response, NextFunction } from 'express';
import { query, getClient } from '../db/pool';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * UC-RPM-03: Create or get a draft application for a circular
 */
export const createApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { circularId } = req.body;

    // Verify circular exists and is accepting applications
    const circular = await query(
      `SELECT id, application_start_date, application_end_date, fee_amount
       FROM circulars WHERE id = $1 AND is_published = TRUE AND is_active = TRUE`,
      [circularId]
    );

    if (circular.rows.length === 0) {
      throw new AppError('Circular not found or not active.', 404);
    }

    const now = new Date();
    const startDate = new Date(circular.rows[0].application_start_date);
    const endDate = new Date(circular.rows[0].application_end_date);

    if (now < startDate) {
      throw new AppError('Application window has not opened yet.', 400);
    }
    if (now > endDate) {
      throw new AppError('Application deadline has passed.', 400);
    }

    // Check for existing application
    const existing = await query(
      `SELECT id, status FROM applications WHERE applicant_id = $1 AND circular_id = $2`,
      [req.user.id, circularId]
    );

    if (existing.rows.length > 0) {
      res.status(200).json({
        success: true,
        data: existing.rows[0],
        message: 'Existing application found.',
      });
      return;
    }

    // Create draft application
    const result = await query(
      `INSERT INTO applications (applicant_id, circular_id, status)
       VALUES ($1, $2, 'draft')
       RETURNING id, status, created_at`,
      [req.user.id, circularId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Draft application created.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-03: Update draft application
 */
export const updateApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;
    const { examSpecificData, photoUrl, signatureUrl } = req.body;

    // Get application
    const app = await query(
      `SELECT a.id, a.status, c.application_end_date
       FROM applications a
       JOIN circulars c ON c.id = a.circular_id
       WHERE a.id = $1 AND a.applicant_id = $2`,
      [id, req.user.id]
    );

    if (app.rows.length === 0) {
      throw new AppError('Application not found.', 404);
    }

    const application = app.rows[0];

    if (application.status === 'finalized') {
      throw new AppError('Application has been finalized and cannot be edited.', 400);
    }

    if (new Date() > new Date(application.application_end_date)) {
      throw new AppError('Application deadline has passed.', 400);
    }

    await query(
      `UPDATE applications
       SET exam_specific_data = COALESCE($1, exam_specific_data),
           photo_url = COALESCE($2, photo_url),
           signature_url = COALESCE($3, signature_url),
           updated_at = NOW()
       WHERE id = $4`,
      [
        examSpecificData ? JSON.stringify(examSpecificData) : null,
        photoUrl || null,
        signatureUrl || null,
        id,
      ]
    );

    res.status(200).json({ success: true, message: 'Application updated.' });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-03: Submit / resubmit application
 */
export const submitApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const client = await getClient();
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;

    await client.query('BEGIN');

    // Get application with circular
    const app = await client.query(
      `SELECT a.*, c.application_end_date
       FROM applications a
       JOIN circulars c ON c.id = a.circular_id
       WHERE a.id = $1 AND a.applicant_id = $2`,
      [id, req.user.id]
    );

    if (app.rows.length === 0) {
      throw new AppError('Application not found.', 404);
    }

    const application = app.rows[0];

    if (application.status === 'finalized') {
      throw new AppError('Application has been finalized.', 400);
    }

    if (new Date() > new Date(application.application_end_date)) {
      throw new AppError('Application deadline has passed.', 400);
    }

    // Take profile snapshot
    const profileSnapshot = await buildProfileSnapshot(client, req.user.id);

    await client.query(
      `UPDATE applications
       SET status = 'submitted',
           profile_snapshot = $1,
           submitted_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(profileSnapshot), id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (applicant_id, action, entity_type, entity_id)
       VALUES ($1, 'APPLICATION_SUBMITTED', 'application', $2)`,
      [req.user.id, id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully. You can edit and resubmit until the deadline.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Get all applications for current user
 */
export const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const result = await query(
      `SELECT a.id, a.status, a.submitted_at, a.finalized_at, a.created_at,
              a.exam_specific_data,
              c.title, c.title_bn, c.exam_type, c.application_end_date, c.exam_date, c.fee_amount,
              p.status as payment_status,
              p.paid_at
       FROM applications a
       JOIN circulars c ON c.id = a.circular_id
       LEFT JOIN payments p ON p.application_id = a.id AND p.status = 'completed'
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-07: Get single application with status and instructions
 */
export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;

    const result = await query(
      `SELECT a.*, c.title, c.title_bn, c.exam_type, c.application_end_date, c.exam_date,
              c.fee_amount, c.eligibility_criteria, c.posts, c.cadre_options
       FROM applications a
       JOIN circulars c ON c.id = a.circular_id
       WHERE a.id = $1 AND a.applicant_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Application not found.', 404);
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

async function buildProfileSnapshot(client: { query: (text: string, params: unknown[]) => Promise<{ rows: unknown[] }> }, applicantId: string): Promise<Record<string, unknown>> {
  const personal = await client.query('SELECT * FROM personal_info WHERE applicant_id = $1', [applicantId]);
  const addresses = await client.query('SELECT * FROM addresses WHERE applicant_id = $1', [applicantId]);
  const education = await client.query('SELECT * FROM education_records WHERE applicant_id = $1 ORDER BY sort_order', [applicantId]);

  return {
    personalInfo: personal.rows[0] || null,
    addresses: addresses.rows,
    educationRecords: education.rows,
    snapshotTakenAt: new Date().toISOString(),
  };
}
