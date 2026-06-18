// src/lib/db/specialistQueries.ts
import { getOne, getMany, executeAction } from './client';
import { MedicalRecord, PatientAssignment, SpecialistDashboard } from '../types/specialist';

// Helper for fetching dashboard stats
export async function getSpecialistDashboardStats(specialistId: string): Promise<SpecialistDashboard> {
  const [assignedRes, totalConsRes, completedConsRes, pendingConsRes, recordsRes] = await Promise.all([
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM patient_specialist_assignments WHERE specialist_id = ? AND status = \'active\'', [specialistId]),
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM consultations WHERE expert_id = ?', [specialistId]),
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM consultations WHERE expert_id = ? AND status = \'completed\'', [specialistId]),
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM consultations WHERE expert_id = ? AND status = \'pending\'', [specialistId]),
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM medical_records WHERE specialist_id = ?', [specialistId])
  ]);

  return {
    totalAssignedPatients: assignedRes?.count || 0,
    totalConsultations: totalConsRes?.count || 0,
    completedConsultations: completedConsRes?.count || 0,
    pendingConsultations: pendingConsRes?.count || 0,
    totalMedicalRecords: recordsRes?.count || 0
  };
}

// Fetch assigned patients
export async function getAssignedPatients(specialistId: string) {
  return await getMany(
    `SELECT p.id, p.first_name, p.last_name, p.email, p.phone_number, a.assigned_at, a.status 
     FROM patient_specialist_assignments a
     JOIN profiles p ON a.patient_id = p.id
     WHERE a.specialist_id = ?
     ORDER BY a.assigned_at DESC`,
    [specialistId]
  );
}

// Fetch single patient details for a specialist
export async function getPatientDetailsForSpecialist(specialistId: string, patientId: string) {
  const [patient, assignment, consultations, medicalRecords] = await Promise.all([
    getOne('SELECT id, first_name, last_name, email, phone_number, date_of_birth, height, weight FROM profiles WHERE id = ?', [patientId]),
    getOne('SELECT status, assigned_at FROM patient_specialist_assignments WHERE specialist_id = ? AND patient_id = ?', [specialistId, patientId]),
    getMany('SELECT id, scheduled_at, status, issue_category, diagnosis FROM consultations WHERE expert_id = ? AND client_id = ? ORDER BY scheduled_at DESC', [specialistId, patientId]),
    getMany('SELECT id, diagnosis, created_at FROM medical_records WHERE specialist_id = ? AND patient_id = ? ORDER BY created_at DESC', [specialistId, patientId])
  ]);

  if (!patient) return null;

  return {
    patient,
    assignment: assignment || null,
    recentConsultations: consultations,
    medicalRecordsSummary: medicalRecords
  };
}

// Medical Records Operations
export async function createMedicalRecord(data: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const { patient_id, specialist_id, consultation_id, diagnosis, treatment_plan, prescription, notes } = data;
  const result = await executeAction(
    `INSERT INTO medical_records (patient_id, specialist_id, consultation_id, diagnosis, treatment_plan, prescription, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patient_id, specialist_id, consultation_id || null, diagnosis, treatment_plan || null, prescription || null, notes || null]
  );
  return result.lastInsertRowid?.toString() || '';
}

export async function getMedicalRecords(specialistId: string) {
  return await getMany(
    `SELECT mr.*, p.first_name, p.last_name 
     FROM medical_records mr
     JOIN profiles p ON mr.patient_id = p.id
     WHERE mr.specialist_id = ?
     ORDER BY mr.created_at DESC`,
    [specialistId]
  );
}

export async function getMedicalRecordById(specialistId: string, recordId: string) {
  return await getOne<MedicalRecord>(
    `SELECT * FROM medical_records WHERE id = ? AND specialist_id = ?`,
    [recordId, specialistId]
  );
}

export async function updateMedicalRecord(recordId: string, specialistId: string, data: Partial<MedicalRecord>): Promise<void> {
  const fields = Object.keys(data).filter(k => !['id', 'specialist_id', 'patient_id', 'created_at', 'updated_at'].includes(k));
  if (fields.length === 0) return;

  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (data as Record<string, unknown>)[f]);

  await executeAction(
    `UPDATE medical_records SET ${setClause}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
     WHERE id = ? AND specialist_id = ?`,
    [...values, recordId, specialistId]
  );
}

// Ensure patient assignment exists (used when creating a consultation or record)
export async function ensurePatientAssignment(specialistId: string, patientId: string): Promise<void> {
  await executeAction(
    `INSERT INTO patient_specialist_assignments (patient_id, specialist_id, status)
     VALUES (?, ?, 'active')
     ON CONFLICT(patient_id, specialist_id) DO UPDATE SET status = 'active'`,
    [patientId, specialistId]
  );
}
