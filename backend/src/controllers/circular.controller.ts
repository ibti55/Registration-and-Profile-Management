import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

/**
 * Get all published circulars
 */
export const getCirculars = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, title, title_bn, description, description_bn, exam_type,
              application_start_date, application_end_date, exam_date,
              fee_amount, is_published, eligibility_criteria, posts, cadre_options, created_at
       FROM circulars
       WHERE is_published = TRUE AND is_active = TRUE
       ORDER BY created_at DESC`
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single circular by ID
 */
export const getCircularById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM circulars WHERE id = $1 AND is_published = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Circular not found', 404);
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
