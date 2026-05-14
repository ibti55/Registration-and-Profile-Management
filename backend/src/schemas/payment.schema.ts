import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
});

export const paymentCallbackSchema = z.object({
  transactionId: z.string().min(1),
  gatewayReference: z.string().optional(),
  status: z.enum(['completed', 'failed']),
  paymentMethod: z.string().optional(),
  gatewayResponse: z.record(z.unknown()).optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;
