import { z } from 'zod';

export const addSpecialistSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
  yearsOfExperience: z.number().min(0, 'Years must be positive'),
  credentials: z.string().min(10, 'Credentials must be at least 10 characters'),
  hospital: z.string().min(3, 'Hospital name required'),
  bio: z.string().optional(),
  hourlyRate: z.number().positive('Rate must be greater than 0'),
});

export type AddSpecialistInput = z.infer<typeof addSpecialistSchema>;
