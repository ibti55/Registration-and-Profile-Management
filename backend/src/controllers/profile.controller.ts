import { Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { query, getClient } from '../db/pool';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import type { UpdateProfileInput } from '../schemas/profile.schema';

/**
 * UC-RPM-02: Get full applicant profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    // Personal info
    const personalResult = await query(
      `SELECT * FROM personal_info WHERE applicant_id = $1`,
      [req.user.id]
    );

    // Addresses
    const addressResult = await query(
      `SELECT * FROM addresses WHERE applicant_id = $1`,
      [req.user.id]
    );

    // Education records
    const educationResult = await query(
      `SELECT * FROM education_records WHERE applicant_id = $1 ORDER BY sort_order ASC`,
      [req.user.id]
    );

    // Applicant basic info
    const applicantResult = await query(
      `SELECT id, email, profile_id, email_verified, created_at FROM applicants WHERE id = $1`,
      [req.user.id]
    );

    const addresses = addressResult.rows.reduce((acc: Record<string, unknown>, addr: Record<string, unknown>) => {
      acc[addr.address_type as string] = addr;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        applicant: applicantResult.rows[0],
        personalInfo: personalResult.rows[0] || null,
        presentAddress: addresses['present'] || null,
        permanentAddress: addresses['permanent'] || null,
        educationRecords: educationResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-02: Update applicant profile (transactional)
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const client = await getClient();
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const { personalInfo, presentAddress, permanentAddress, educationRecords } = req.body as UpdateProfileInput;

    await client.query('BEGIN');

    // Update personal info
    if (personalInfo) {
      await client.query(
        `INSERT INTO personal_info (applicant_id, applicant_name, father_name, mother_name, date_of_birth,
          gender, employment_status, quota, marital_status, nationality, has_nid, nid_number,
          has_birth_registration, birth_registration_number, has_passport, passport_number,
          height_cm, weight_kg, chest_cm, contact_mobile, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
         ON CONFLICT (applicant_id) DO UPDATE SET
          applicant_name = COALESCE($2, personal_info.applicant_name),
          father_name = COALESCE($3, personal_info.father_name),
          mother_name = COALESCE($4, personal_info.mother_name),
          date_of_birth = COALESCE($5, personal_info.date_of_birth),
          gender = COALESCE($6, personal_info.gender),
          employment_status = COALESCE($7, personal_info.employment_status),
          quota = COALESCE($8, personal_info.quota),
          marital_status = COALESCE($9, personal_info.marital_status),
          nationality = COALESCE($10, personal_info.nationality),
          has_nid = COALESCE($11, personal_info.has_nid),
          nid_number = COALESCE($12, personal_info.nid_number),
          has_birth_registration = COALESCE($13, personal_info.has_birth_registration),
          birth_registration_number = COALESCE($14, personal_info.birth_registration_number),
          has_passport = COALESCE($15, personal_info.has_passport),
          passport_number = COALESCE($16, personal_info.passport_number),
          height_cm = COALESCE($17, personal_info.height_cm),
          weight_kg = COALESCE($18, personal_info.weight_kg),
          chest_cm = COALESCE($19, personal_info.chest_cm),
          contact_mobile = COALESCE($20, personal_info.contact_mobile),
          updated_at = NOW()`,
        [
          req.user.id,
          personalInfo.applicantName || null,
          personalInfo.fatherName || null,
          personalInfo.motherName || null,
          personalInfo.dateOfBirth || null,
          personalInfo.gender || null,
          personalInfo.employmentStatus || null,
          personalInfo.quota || null,
          personalInfo.maritalStatus || null,
          personalInfo.nationality || null,
          personalInfo.hasNid ?? null,
          personalInfo.nidNumber || null,
          personalInfo.hasBirthRegistration ?? null,
          personalInfo.birthRegistrationNumber || null,
          personalInfo.hasPassport ?? null,
          personalInfo.passportNumber || null,
          personalInfo.heightCm || null,
          personalInfo.weightKg || null,
          personalInfo.chestCm || null,
          personalInfo.contactMobile || null,
        ]
      );
    }

    // Update present address
    if (presentAddress) {
      await upsertAddress(client, req.user.id, 'present', presentAddress);
    }

    // Update permanent address
    if (permanentAddress) {
      await upsertAddress(client, req.user.id, 'permanent', permanentAddress);
    }

    // Update education records – replace all
    if (educationRecords && educationRecords.length > 0) {
      await client.query('DELETE FROM education_records WHERE applicant_id = $1', [req.user.id]);

      for (let i = 0; i < educationRecords.length; i++) {
        const edu = educationRecords[i];
        await client.query(
          `INSERT INTO education_records (applicant_id, level, examination, board, roll, result,
            "group", subject_degree, passing_year, university_institute, course_duration,
            student_id, roll_no, session, qualification_type, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            req.user.id, edu.level, edu.examination || null, edu.board || null,
            edu.roll || null, edu.result || null, edu.group || null,
            edu.subjectDegree || null, edu.passingYear || null,
            edu.universityInstitute || null, edu.courseDuration || null,
            edu.studentId || null, edu.rollNo || null, edu.session || null,
            edu.qualificationType || null, i,
          ]
        );
      }
    }

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (applicant_id, action, entity_type, entity_id, new_data)
       VALUES ($1, 'PROFILE_UPDATE', 'applicant', $2, $3)`,
      [req.user.id, req.user.id, JSON.stringify(req.body)]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

async function upsertAddress(
  client: PoolClient,
  applicantId: string,
  addressType: string,
  address: Record<string, unknown>
): Promise<void> {
  await client.query(
    `INSERT INTO addresses (applicant_id, address_type, care_of, village_town_road, district, upazilla, post_office, post_code, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (applicant_id, address_type) DO UPDATE SET
      care_of = COALESCE($3, addresses.care_of),
      village_town_road = COALESCE($4, addresses.village_town_road),
      district = COALESCE($5, addresses.district),
      upazilla = COALESCE($6, addresses.upazilla),
      post_office = COALESCE($7, addresses.post_office),
      post_code = COALESCE($8, addresses.post_code),
      updated_at = NOW()`,
    [
      applicantId, addressType,
      address.careOf || null, address.villageTownRoad || null,
      address.district || null, address.upazilla || null,
      address.postOffice || null, address.postCode || null,
    ]
  );
}

/**
 * Upload photo/signature
 */
export const uploadFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    if (!req.file) throw new AppError('No file uploaded', 400);

    const fileType = req.params.type as string; // 'photo' or 'signature'
    if (fileType !== 'photo' && fileType !== 'signature') {
      throw new AppError('Invalid file type. Must be "photo" or "signature".', 400);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const column = fileType === 'photo' ? 'photo_url' : 'signature_url';

    await query(
      `UPDATE personal_info SET ${column} = $1, updated_at = NOW() WHERE applicant_id = $2`,
      [fileUrl, req.user.id]
    );

    res.status(200).json({
      success: true,
      data: { url: fileUrl },
    });
  } catch (error) {
    next(error);
  }
};
