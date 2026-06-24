import { getOne, getMany, executeAction } from "@/lib/db/client";

interface ExpertQueryResult {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  specialties: string;
  license_number: string | null;
  medical_council_number: string | null;
  practicing_certificate_url: string | null;
  hospital_name: string | null;
  years_of_experience: number;
  hourly_rate: number;
  currency: string;
  verification_status: string;
  profile_status: string;
  submitted_for_review_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  is_available: number;
  average_rating: number;
  total_reviews: number;
  total_consultations: number;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface AvailabilityRow {
  id: string;
  expert_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: number;
  created_at: string;
}

// Helpers to map Turso Expert schema to legacy Doctor schema
function mapExpertToDoctor(row: ExpertQueryResult, availability: AvailabilityRow[] = []) {
  const fullName = `${row.first_name || ""} ${row.last_name || ""}`.trim();
  return {
    ...row,
    hospital: row.hospital_name || null,
    consultation_fee: row.hourly_rate || 0.0,
    years_experience: row.years_of_experience || 0,
    profiles: {
      full_name: fullName || row.display_name || "",
      avatar_url: row.avatar_url || null,
      email: row.email || null,
    },
    doctor_availability: availability.map(a => ({
      id: a.id,
      doctor_id: a.expert_id,
      day: a.day_of_week?.toString() || "",
      start_time: a.start_time,
      end_time: a.end_time,
    }))
  };
}

export async function getApprovedDoctors() {
  const rows = await getMany<ExpertQueryResult>(
    `SELECT e.*, p.first_name, p.last_name, p.email, p.avatar_url 
     FROM experts e
     JOIN profiles p ON e.user_id = p.id
     WHERE e.profile_status = 'approved' AND e.is_available = 1`
  );
  return rows.map(row => mapExpertToDoctor(row));
}

export async function getDoctorById(id: string) {
  const row = await getOne<ExpertQueryResult>(
    `SELECT e.*, p.first_name, p.last_name, p.email, p.avatar_url 
     FROM experts e
     JOIN profiles p ON e.user_id = p.id
     WHERE e.id = ?`,
    [id]
  );
  if (!row) return null;
  const availability = await getMany<AvailabilityRow>(
    `SELECT * FROM expert_availability WHERE expert_id = ?`,
    [id]
  );
  return mapExpertToDoctor(row, availability);
}

export async function getDoctorByUserId(userId: string) {
  const row = await getOne<ExpertQueryResult>(
    `SELECT e.*, p.first_name, p.last_name, p.email, p.avatar_url 
     FROM experts e
     JOIN profiles p ON e.user_id = p.id
     WHERE e.user_id = ?`,
    [userId]
  );
  if (!row) return null;
  const availability = await getMany<AvailabilityRow>(
    `SELECT * FROM expert_availability WHERE expert_id = ?`,
    [row.id]
  );
  return mapExpertToDoctor(row, availability);
}

export async function updateDoctorProfile(
  doctorId: string,
  fields: Partial<{
    bio: string;
    hospital: string;
    consultation_fee: number;
    years_experience: number;
    is_available: boolean;
  }>
) {
  const updateFields: Record<string, unknown> = {};
  if (fields.bio !== undefined) updateFields.bio = fields.bio;
  if (fields.hospital !== undefined) updateFields.hospital_name = fields.hospital;
  if (fields.consultation_fee !== undefined) updateFields.hourly_rate = fields.consultation_fee;
  if (fields.years_experience !== undefined) updateFields.years_of_experience = fields.years_experience;
  if (fields.is_available !== undefined) updateFields.is_available = fields.is_available ? 1 : 0;

  const keys = Object.keys(updateFields);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => updateFields[k]);

  await executeAction(
    `UPDATE experts SET ${setClause}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
     WHERE id = ?`,
    [...values, doctorId]
  );
}

export async function updateDoctorVerification(
  doctorId: string,
  verification_status: "APPROVED" | "REJECTED" | "PENDING"
) {
  const status = verification_status.toLowerCase() as 'approved' | 'rejected' | 'pending';
  const profileStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending_review';

  await executeAction(
    `UPDATE experts 
     SET verification_status = ?, profile_status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
     WHERE id = ?`,
    [status, profileStatus, doctorId]
  );
}

export async function upsertAvailability(
  doctorId: string,
  slots: { day: string; start_time: string; end_time: string }[]
) {
  await executeAction(`DELETE FROM expert_availability WHERE expert_id = ?`, [doctorId]);
  if (slots.length === 0) return;

  for (const slot of slots) {
    const id = crypto.randomUUID();
    const dayOfWeek = parseInt(slot.day, 10) || 0;
    await executeAction(
      `INSERT INTO expert_availability (id, expert_id, day_of_week, start_time, end_time, is_available)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [id, doctorId, dayOfWeek, slot.start_time, slot.end_time]
    );
  }
}
