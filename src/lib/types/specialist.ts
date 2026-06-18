// src/lib/types/specialist.ts

import { z } from "zod";

// Base Interfaces matching Database Schema
export interface MedicalRecord {
  id: string;
  patient_id: string;
  specialist_id: string;
  consultation_id?: string | null;
  diagnosis: string;
  treatment_plan?: string | null;
  prescription?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientAssignment {
  id: string;
  patient_id: string;
  specialist_id: string;
  status: 'active' | 'inactive';
  assigned_at: string;
}

export interface SpecialistDashboard {
  totalAssignedPatients: number;
  totalConsultations: number;
  completedConsultations: number;
  pendingConsultations: number;
  totalMedicalRecords: number;
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

export const CreateConsultationSchema = z.object({
  patient_id: z.string().min(1, "Patient ID is required"),
  specialist_id: z.string().min(1, "Specialist ID is required"),
  scheduled_at: z.string().min(1, "Schedule date is required"),
  issue_category: z.string().min(1, "Category is required"),
  issue_description: z.string().optional(),
});

export const UpdateConsultationSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
});

export const CreateMedicalRecordSchema = z.object({
  patient_id: z.string().min(1, "Patient ID is required"),
  consultation_id: z.string().optional(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  treatment_plan: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateMedicalRecordSchema = z.object({
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
});

export const AvailabilitySchema = z.object({
  day_of_week: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
});
