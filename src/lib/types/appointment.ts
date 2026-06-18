import { z } from "zod";

// ==========================================
// INTERFACES
// ==========================================

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';

export interface Appointment {
  id: string;
  patient_id: string;
  specialist_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  reason_for_visit?: string | null;
  status: AppointmentStatus;
  booked_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  specialistId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reasonForVisit?: string;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  specialistId?: string;
  patientId?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
}

export interface AppointmentHistory {
  id: string;
  appointment_id: string;
  previous_status: AppointmentStatus;
  new_status: AppointmentStatus;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

// ==========================================
// ZOD SCHEMAS
// ==========================================

export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const CreateAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  specialistId: z.string().min(1, "Specialist ID is required"),
  appointmentDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  reasonForVisit: z.string().optional(),
}).refine(data => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const UpdateAppointmentSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  reasonForVisit: z.string().optional(),
});

export const RescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(timeRegex, "Invalid time format (HH:MM)"),
}).refine(data => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const AppointmentFilterSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  dateFrom: z.string().regex(dateRegex, "Invalid date format").optional(),
  dateTo: z.string().regex(dateRegex, "Invalid date format").optional(),
  specialistId: z.string().optional(),
  patientId: z.string().optional(),
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});
