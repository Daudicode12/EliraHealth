import { getOne, getMany, executeAction } from './client';
export { getOne, getMany, executeAction };
import { 
  Profile, 
  Expert, 
  ExpertAvailability, 
  Consultation, 
  ConsultationMessage, 
  ExpertReview 
} from './types';

// ==========================================
// PROFILES (Users)
// ==========================================

export async function getProfileById(id: string): Promise<Profile | null> {
  return await getOne<Profile>('SELECT * FROM profiles WHERE id = ?', [id]);
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  return await getOne<Profile>('SELECT * FROM profiles WHERE email = ?', [email]);
}

export async function createProfile(data: Partial<Profile>): Promise<void> {
  const { id, email, first_name, last_name, role, phone_number } = data;
  await executeAction(
    'INSERT INTO profiles (id, email, first_name, last_name, role, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
    [id, email, first_name, last_name, role || 'user', phone_number]
  );
}

export async function updateProfile(id: string, data: Partial<Profile>): Promise<void> {
  const fields = Object.keys(data).filter(k => k !== 'id');
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (data as Record<string, unknown>)[f]);
  
  await executeAction(
    `UPDATE profiles SET ${setClause}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
    [...values, id]
  );
}

export async function getAllPatients(filters?: { limit?: number; offset?: number }): Promise<Profile[]> {
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  return await getMany<Profile>(
    "SELECT * FROM profiles WHERE role = 'user' ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );
}

// ==========================================
// EXPERTS
// ==========================================

export async function createExpert(data: Partial<Expert>): Promise<void> {
  const { 
    user_id, display_name, specialties, license_number, 
    medical_council_number, practicing_certificate_url, hospital_name,
    years_of_experience, hourly_rate, profile_status
  } = data;
  
  await executeAction(
    `INSERT INTO experts (
      user_id, display_name, specialties, license_number, 
      medical_council_number, practicing_certificate_url, hospital_name,
      years_of_experience, hourly_rate, verification_status, profile_status
    ) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      user_id, display_name, specialties, license_number, 
      medical_council_number, practicing_certificate_url, hospital_name,
      years_of_experience, hourly_rate, profile_status || 'profile_incomplete'
    ]
  );
}

export async function getExpertById(id: string): Promise<Expert | null> {
  return await getOne<Expert>('SELECT * FROM experts WHERE id = ?', [id]);
}

export async function getExpertByUserId(userId: string): Promise<Expert | null> {
  return await getOne<Expert>('SELECT * FROM experts WHERE user_id = ?', [userId]);
}

export async function getExpertsByStatus(status: 'pending' | 'approved' | 'rejected' | 'suspended'): Promise<(Expert & { email: string; phone_number: string })[]> {
  const dbStatus = status === 'pending' ? 'pending_review' : status;
  return await getMany<Expert & { email: string; phone_number: string }>(
    `SELECT e.*, p.email, p.phone_number
     FROM experts e 
     JOIN profiles p ON e.user_id = p.id 
     WHERE e.profile_status = ? 
     ORDER BY e.created_at DESC`,
    [dbStatus]
  );
}

export async function getPendingExperts(): Promise<(Expert & { email: string; phone_number: string })[]> {
  return await getExpertsByStatus('pending');
}

export async function getVerifiedExperts(filters?: { specialty?: string }): Promise<Expert[]> {
  let sql = "SELECT * FROM experts WHERE profile_status = 'approved' AND is_available = 1";
  const args: unknown[] = [];
  
  if (filters?.specialty) {
    sql += ' AND specialties LIKE ?';
    args.push(`%${filters.specialty}%`);
  }
  
  sql += ' ORDER BY average_rating DESC';
  return await getMany<Expert>(sql, args);
}

// ==========================================
// NOTIFICATIONS (Placeholder)
// ==========================================

export async function createNotification(userId: string, message: string, type: 'info' | 'success' | 'error' | 'warning'): Promise<void> {
  console.log(`[Notification to ${userId}]: [${type.toUpperCase()}] ${message}`);
}

import { sendNotificationAndEmail } from '../services/notification.service';
import SpecialistApprovedEmail from '../email/templates/specialist-approved';
import SpecialistRejectedEmail from '../email/templates/specialist-rejected';


export async function approveExpert(expertId: string, adminId: string): Promise<void> {
  await executeAction(
    `UPDATE experts 
     SET profile_status = 'approved', 
         verification_status = 'approved',
         verified_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
         verified_by = ?
     WHERE id = ?`, 
    [adminId, expertId]
  );
  
  const expert = await getExpertById(expertId);
  if (expert) {
    const profile = await getProfileById(expert.user_id);
    if (profile) {
      await sendNotificationAndEmail({
        userId: expert.user_id,
        emailTo: profile.email as string,
        emailSubject: "Elira Health - Profile Approved",
        title: "Profile Approved",
        message: "Congratulations! Your specialist profile has been approved.",
        type: "approval",
        actionUrl: "/specialist/dashboard",
        emailTemplate: SpecialistApprovedEmail({
          name: expert.display_name as string,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
        })
      });
    }
  }
}

export async function rejectExpert(expertId: string, reason: string): Promise<void> {
  await executeAction(
    `UPDATE experts 
     SET profile_status = 'rejected', 
         verification_status = 'rejected',
         rejection_reason = ? 
     WHERE id = ?`, 
    [reason, expertId]
  );
  
  const expert = await getExpertById(expertId);
  if (expert) {
    const profile = await getProfileById(expert.user_id);
    if (profile && profile.email) {
      await sendNotificationAndEmail({
        userId: expert.user_id,
        emailTo: profile.email as string,
        emailSubject: "Elira Health - Profile Update",
        title: "Application Status Update",
        message: `Your application was not approved. Reason: ${reason}`,
        type: "rejection",
        emailTemplate: SpecialistRejectedEmail({
          name: expert.display_name as string,
          reason
        })
      });
    }
  }
}

export async function suspendExpert(expertId: string): Promise<void> {
  await executeAction(
    `UPDATE experts 
     SET profile_status = 'suspended',
         verification_status = 'suspended' 
     WHERE id = ?`, 
    [expertId]
  );
  
  const expert = await getExpertById(expertId);
  if (expert) {
    await createNotification(expert.user_id, "Your specialist account has been suspended. Please contact support.", "warning");
  }
}

export async function updateExpert(id: string, data: Partial<Expert>): Promise<void> {
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'user_id');
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => (data as Record<string, unknown>)[f]);
  
  await executeAction(
    `UPDATE experts SET ${setClause}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
    [...values, id]
  );
}

export async function getExpertStatusCounts(): Promise<Record<string, number>> {
  const counts = await getMany<{ profile_status: string; count: number }>(
    'SELECT profile_status, COUNT(*) as count FROM experts GROUP BY profile_status'
  );
  
  const result: Record<string, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0
  };
  
  counts.forEach(row => {
    if (row.profile_status === 'pending_review') {
      result.pending = row.count;
    } else if (row.profile_status in result) {
      result[row.profile_status] = row.count;
    }
  });
  
  return result;
}

// ==========================================
// EXPERT AVAILABILITY
// ==========================================

export async function getExpertAvailability(expertId: string): Promise<ExpertAvailability[]> {
  return await getMany<ExpertAvailability>(
    'SELECT * FROM expert_availability WHERE expert_id = ? AND is_available = 1 ORDER BY day_of_week, start_time',
    [expertId]
  );
}

export async function createAvailability(data: Partial<ExpertAvailability>): Promise<void> {
  const { expert_id, day_of_week, start_time, end_time } = data;
  await executeAction(
    'INSERT INTO expert_availability (expert_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
    [expert_id, day_of_week, start_time, end_time]
  );
}

export async function deleteAvailability(id: string): Promise<void> {
  await executeAction('DELETE FROM expert_availability WHERE id = ?', [id]);
}

// ==========================================
// CONSULTATIONS
// ==========================================

export async function createConsultation(data: Partial<Consultation>): Promise<string> {
  const { patient_id, specialist_id, started_at, assessment, chief_complaint } = data;
  const result = await executeAction(
    `INSERT INTO consultations (patient_id, specialist_id, started_at, assessment, chief_complaint, status) 
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [patient_id, specialist_id, started_at, assessment, chief_complaint]
  );
  return result.lastInsertRowid?.toString() || '';
}

export async function getPatientConsultations(patientId: string): Promise<Array<Consultation & { expert_name: string }>> {
  return await getMany<Consultation & { expert_name: string }>(
    `SELECT c.id, c.patient_id, c.specialist_id, c.status, c.started_at, c.created_at, c.updated_at,
      e.display_name as expert_name 
     FROM consultations c 
     LEFT JOIN experts e ON c.specialist_id = e.id 
     WHERE c.patient_id = ? 
     ORDER BY c.created_at DESC`,
    [patientId]
  );
}

export async function getExpertConsultations(specialistId: string): Promise<Array<Consultation & { first_name: string; last_name: string }>> {
  return await getMany<Consultation & { first_name: string; last_name: string }>(
    `SELECT c.id, c.patient_id, c.specialist_id, c.status, c.started_at, c.created_at, c.updated_at,
      p.first_name, p.last_name 
     FROM consultations c 
     LEFT JOIN profiles p ON c.patient_id = p.id 
     WHERE c.specialist_id = ? 
     ORDER BY c.created_at DESC`,
    [specialistId]
  );
}

export async function getPendingConsultations(): Promise<Array<Consultation & { first_name: string; last_name: string; expert_name: string }>> {
  return await getMany<Consultation & { first_name: string; last_name: string; expert_name: string }>(
    `SELECT c.id, c.patient_id, c.specialist_id, c.status, c.started_at, c.created_at, c.updated_at,
      p.first_name, p.last_name, e.display_name as expert_name 
     FROM consultations c 
     LEFT JOIN profiles p ON c.patient_id = p.id 
     LEFT JOIN experts e ON c.specialist_id = e.id 
     WHERE c.status = 'scheduled' 
     ORDER BY c.created_at ASC`
  );
}

export async function updateConsultationStatus(id: string, status: string): Promise<void> {
  await executeAction(
    `UPDATE consultations SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
    [status, id]
  );
}

export async function getConsultationById(id: string): Promise<Consultation | null> {
  return await getOne<Consultation>('SELECT * FROM consultations WHERE id = ?', [id]);
}

// ==========================================
// CONSULTATION MESSAGES
// ==========================================

export async function sendConsultationMessage(data: Partial<ConsultationMessage>): Promise<void> {
  const { consultation_id, sender_id, content, message_type } = data;
  await executeAction(
    'INSERT INTO consultation_messages (consultation_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)',
    [consultation_id, sender_id, content, message_type || 'text']
  );
}

export async function getConsultationMessages(consultationId: string): Promise<Array<ConsultationMessage & { first_name: string; last_name: string }>> {
  return await getMany<ConsultationMessage & { first_name: string; last_name: string }>(
    `SELECT cm.*, p.first_name, p.last_name 
     FROM consultation_messages cm 
     JOIN profiles p ON cm.sender_id = p.id 
     WHERE cm.consultation_id = ? 
     ORDER BY cm.created_at ASC`,
    [consultationId]
  );
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  await executeAction(
    "UPDATE consultation_messages SET is_read = 1, read_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
    [messageId]
  );
}

// ==========================================
// EXPERT REVIEWS
// ==========================================

export async function createReview(data: Partial<ExpertReview>): Promise<void> {
  const { consultation_id, client_id, expert_id, rating, comment, is_anonymous } = data;
  await executeAction(
    'INSERT INTO expert_reviews (consultation_id, client_id, expert_id, rating, comment, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)',
    [consultation_id, client_id, expert_id, rating, comment, is_anonymous ? 1 : 0]
  );
}

export async function getExpertReviews(expertId: string): Promise<Array<ExpertReview & { reviewer_name: string }>> {
  return await getMany<ExpertReview & { reviewer_name: string }>(
    `SELECT er.*, 
     CASE WHEN er.is_anonymous = 1 THEN 'Anonymous' ELSE p.first_name END as reviewer_name 
     FROM expert_reviews er 
     JOIN profiles p ON er.client_id = p.id 
     WHERE er.expert_id = ? 
     ORDER BY er.created_at DESC`,
    [expertId]
  );
}

// ==========================================
// ADMIN FEATURES
// ==========================================

export async function getPatientRecord(patientId: string): Promise<(Profile & { consultations: Consultation[] }) | null> {
  const profile = await getProfileById(patientId);
  if (!profile) return null;
  
  const consultations = await getPatientConsultations(patientId);
  return {
    ...profile,
    consultations: consultations as unknown as Consultation[]
  };
}

/**
 * Create specialist account directly from admin
 * Sets verification_status = 'approved' immediately (no pending approval)
 */
export async function createSpecialistByAdmin(data: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  specialties: string[];
  yearsOfExperience: number;
  credentials: string;
  hospital: string;
  bio?: string;
  hourlyRate: number;
}): Promise<void> {
  // Create in profiles table
  await createProfile({
    id: data.userId,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    phone_number: data.phoneNumber,
    role: 'expert',
  });

  // Create in experts table
  await createExpert({
    user_id: data.userId,
    display_name: `${data.firstName} ${data.lastName}`,
    specialties: JSON.stringify(data.specialties),
    license_number: data.credentials,
    years_of_experience: data.yearsOfExperience,
    hourly_rate: data.hourlyRate,
    hospital_name: data.hospital,
    bio: data.bio,
  });

  // Set profile_status & verification_status = 'approved' immediately
  const expert = await getExpertByUserId(data.userId);
  if (expert) {
    await updateExpert(expert.id, {
      profile_status: 'approved',
      verification_status: 'approved',
      verified_at: new Date().toISOString(),
      is_available: 1
    });
  }
}

