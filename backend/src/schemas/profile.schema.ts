import { z } from 'zod';

export const personalInfoSchema = z.object({
  applicantName: z.string().min(1).max(255).optional(),
  fatherName: z.string().max(255).optional(),
  motherName: z.string().max(255).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  employmentStatus: z.string().max(100).optional(),
  quota: z.string().max(100).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  nationality: z.string().max(100).optional(),
  hasNid: z.boolean().optional(),
  nidNumber: z.string().max(20).optional(),
  hasBirthRegistration: z.boolean().optional(),
  birthRegistrationNumber: z.string().max(30).optional(),
  hasPassport: z.boolean().optional(),
  passportNumber: z.string().max(20).optional(),
  heightCm: z.number().positive().max(300).optional(),
  weightKg: z.number().positive().max(500).optional(),
  chestCm: z.number().positive().max(300).optional(),
  contactMobile: z.string().max(15).optional(),
});

export const addressSchema = z.object({
  addressType: z.enum(['present', 'permanent']),
  careOf: z.string().max(255).optional(),
  villageTownRoad: z.string().max(500).optional(),
  district: z.string().max(100).optional(),
  upazilla: z.string().max(100).optional(),
  postOffice: z.string().max(100).optional(),
  postCode: z.string().max(10).optional(),
});

export const educationRecordSchema = z.object({
  level: z.enum(['ssc', 'hsc', 'graduation', 'masters', 'other']),
  examination: z.string().max(100).optional(),
  board: z.string().max(100).optional(),
  roll: z.string().max(50).optional(),
  result: z.string().max(50).optional(),
  group: z.string().max(100).optional(),
  subjectDegree: z.string().max(200).optional(),
  passingYear: z.string().max(4).optional(),
  universityInstitute: z.string().max(300).optional(),
  courseDuration: z.string().max(20).optional(),
  studentId: z.string().max(50).optional(),
  rollNo: z.string().max(50).optional(),
  session: z.string().max(50).optional(),
  qualificationType: z.string().max(100).optional(),
});

export const updateProfileSchema = z.object({
  personalInfo: personalInfoSchema.optional(),
  presentAddress: addressSchema.optional(),
  permanentAddress: addressSchema.optional(),
  educationRecords: z.array(educationRecordSchema).optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type EducationRecordInput = z.infer<typeof educationRecordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
