import { z } from 'zod';

export const createApplicationSchema = z.object({
  circularId: z.string().uuid('Invalid circular ID'),
});

export const updateApplicationSchema = z.object({
  examSpecificData: z.record(z.unknown()).optional(),
  photoUrl: z.string().optional(),
  signatureUrl: z.string().optional(),
});

export const submitApplicationSchema = z.object({
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the application before submission',
  }),
});

export const applicationIdParamSchema = z.object({
  id: z.string().uuid('Invalid application ID'),
});

export const circularIdParamSchema = z.object({
  id: z.string().uuid('Invalid circular ID'),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
