import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool';

/**
 * Get all districts
 */
export const getDistricts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query('SELECT * FROM districts ORDER BY name ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get upazillas by district
 */
export const getUpazillas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { districtId } = req.params;
    const result = await query(
      'SELECT * FROM upazillas WHERE district_id = $1 ORDER BY name ASC',
      [districtId]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get education boards
 */
export const getEducationBoards = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query('SELECT * FROM education_boards ORDER BY name ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get universities
 */
export const getUniversities = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await query('SELECT * FROM universities ORDER BY name ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subjects by level
 */
export const getSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level } = req.params;
    const result = await query(
      'SELECT * FROM subjects WHERE level = $1 ORDER BY name ASC',
      [level]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
