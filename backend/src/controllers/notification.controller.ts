import { Response, NextFunction } from 'express';
import { query } from '../db/pool';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * UC-RPM-08: Get notifications for current user
 */
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, title, title_bn, message, message_bn, channel, status,
              is_read, read_at, related_entity_type, related_entity_id, created_at
       FROM notifications
       WHERE applicant_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM notifications WHERE applicant_id = $1',
      [req.user.id]
    );

    const unreadCount = await query(
      'SELECT COUNT(*) as total FROM notifications WHERE applicant_id = $1 AND is_read = FALSE',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        notifications: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
        unreadCount: parseInt(unreadCount.rows[0].total, 10),
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND applicant_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Notification not found.', 404);
    }

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    await query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE applicant_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification preferences
 */
export const getPreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const result = await query(
      'SELECT * FROM notification_preferences WHERE applicant_id = $1',
      [req.user.id]
    );

    res.status(200).json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-08: Update notification preferences
 */
export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { emailEnabled, smsEnabled, dashboardEnabled, circularAlerts, statusUpdates } = req.body;

    await query(
      `INSERT INTO notification_preferences (applicant_id, email_enabled, sms_enabled, dashboard_enabled, circular_alerts, status_updates, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (applicant_id) DO UPDATE SET
        email_enabled = COALESCE($2, notification_preferences.email_enabled),
        sms_enabled = COALESCE($3, notification_preferences.sms_enabled),
        dashboard_enabled = COALESCE($4, notification_preferences.dashboard_enabled),
        circular_alerts = COALESCE($5, notification_preferences.circular_alerts),
        status_updates = COALESCE($6, notification_preferences.status_updates),
        updated_at = NOW()`,
      [req.user.id, emailEnabled, smsEnabled, dashboardEnabled, circularAlerts, statusUpdates]
    );

    res.status(200).json({ success: true, message: 'Preferences updated.' });
  } catch (error) {
    next(error);
  }
};
