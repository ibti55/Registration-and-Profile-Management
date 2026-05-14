import { z } from 'zod';

export const updateNotificationPreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  dashboardEnabled: z.boolean().optional(),
  circularAlerts: z.boolean().optional(),
  statusUpdates: z.boolean().optional(),
});

export const markNotificationReadSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
