import { Response, NextFunction } from 'express';
import { query } from '../db/pool';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * UC-RPM-04: Initiate payment for an application
 */
export const initiatePayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const { applicationId } = req.body;

    // Get application with circular fee
    const app = await query(
      `SELECT a.id, a.status, c.fee_amount
       FROM applications a
       JOIN circulars c ON c.id = a.circular_id
       WHERE a.id = $1 AND a.applicant_id = $2`,
      [applicationId, req.user.id]
    );

    if (app.rows.length === 0) {
      throw new AppError('Application not found.', 404);
    }

    const application = app.rows[0];

    if (application.status === 'draft') {
      throw new AppError('Please submit the application before making payment.', 400);
    }

    // Check for existing completed payment
    const existingPayment = await query(
      `SELECT id FROM payments WHERE application_id = $1 AND status = 'completed'`,
      [applicationId]
    );

    if (existingPayment.rows.length > 0) {
      throw new AppError('Payment has already been completed for this application.', 400);
    }

    // Create payment record
    const payment = await query(
      `INSERT INTO payments (application_id, applicant_id, amount, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, amount, status`,
      [applicationId, req.user.id, application.fee_amount]
    );

    // In production, redirect to payment gateway here.
    // For now, return payment details for the frontend to handle.
    res.status(201).json({
      success: true,
      data: {
        paymentId: payment.rows[0].id,
        amount: payment.rows[0].amount,
        // In production: gatewayUrl, redirectUrl, etc.
      },
      message: 'Payment initiated. Complete payment via the gateway.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-RPM-04: Payment callback (simulated gateway callback)
 */
export const paymentCallback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { transactionId, gatewayReference, status, paymentMethod, gatewayResponse } = req.body;
    const { id: paymentId } = req.params;

    const payment = await query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    if (payment.rows.length === 0) {
      throw new AppError('Payment record not found.', 404);
    }

    if (payment.rows[0].status === 'completed') {
      throw new AppError('Payment already completed.', 400);
    }

    if (status === 'completed') {
      // Update payment
      await query(
        `UPDATE payments
         SET status = 'completed', transaction_id = $1, gateway_reference = $2,
             payment_method = $3, gateway_response = $4, paid_at = NOW(), updated_at = NOW()
         WHERE id = $5`,
        [transactionId, gatewayReference || null, paymentMethod || null, JSON.stringify(gatewayResponse || {}), paymentId]
      );

      // Update application status
      await query(
        `UPDATE applications SET status = 'payment_completed', updated_at = NOW()
         WHERE id = $1`,
        [payment.rows[0].application_id]
      );

      // Create notification
      await query(
        `INSERT INTO notifications (applicant_id, title, message, channel, status, related_entity_type, related_entity_id, sent_at)
         VALUES ($1, 'Payment Successful', 'Your payment has been confirmed. Transaction ID: ' || $2, 'dashboard', 'sent', 'payment', $3, NOW())`,
        [payment.rows[0].applicant_id, transactionId, paymentId]
      );

      // Audit log
      await query(
        `INSERT INTO audit_logs (applicant_id, action, entity_type, entity_id)
         VALUES ($1, 'PAYMENT_COMPLETED', 'payment', $2)`,
        [payment.rows[0].applicant_id, paymentId]
      );
    } else {
      await query(
        `UPDATE payments SET status = 'failed', gateway_response = $1, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(gatewayResponse || {}), paymentId]
      );
    }

    res.status(200).json({
      success: true,
      message: status === 'completed' ? 'Payment confirmed.' : 'Payment failed.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment history for current user
 */
export const getMyPayments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const result = await query(
      `SELECT p.*, c.title as circular_title
       FROM payments p
       JOIN applications a ON a.id = p.application_id
       JOIN circulars c ON c.id = a.circular_id
       WHERE p.applicant_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
