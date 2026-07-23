import { executeAction, getOne, getMany } from '@/lib/db/client';
import { sendNotificationAndEmail } from '@/lib/services/notification.service';
import ConsultationCompletedEmail from '@/lib/email/templates/consultation-completed';
import { getProfileById, getExpertById } from '@/lib/db/queries';

// Types
export interface ConsultationRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  specialist_id: string;
  client_id?: string;
  expert_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationNote {
  id: string;
  consultation_id: string;
  chief_complaint: string | null;
  symptoms: string | null;
  assessment: string | null;
  recommendations: string | null;
  follow_up_required: number;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsultationWithDetails extends ConsultationRecord {
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  patient_date_of_birth: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason_for_visit: string | null;
  specialist_name: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'consultation';
  is_read: number;
  link: string | null;
  created_at: string;
}

export const ConsultationService = {

  // Get confirmed appointments that can become consultations (for specialist)
  async getUpcomingConsultations(specialistId: string): Promise<ConsultationWithDetails[]> {
    return await getMany<ConsultationWithDetails>(
      `SELECT 
        COALESCE(c.id, 'pending-' || a.id) as id,
        a.id as appointment_id,
        a.patient_id,
        a.specialist_id,
        COALESCE(c.status, 'scheduled') as status,
        c.started_at,
        c.ended_at,
        COALESCE(c.created_at, a.created_at) as created_at,
        COALESCE(c.updated_at, a.updated_at) as updated_at,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.email as patient_email,
        p.phone_number as patient_phone,
        p.date_of_birth as patient_date_of_birth,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.reason_for_visit,
        e.display_name as specialist_name
      FROM appointments a
      JOIN profiles p ON a.patient_id = p.id
      JOIN experts e ON a.specialist_id = e.id
      LEFT JOIN consultations c ON c.appointment_id = a.id
      WHERE a.specialist_id = ?
        AND a.status = 'CONFIRMED'
        AND (c.status IS NULL OR c.status = 'scheduled')
      ORDER BY a.appointment_date ASC, a.start_time ASC`,
      [specialistId]
    );
  },

  // Get in-progress consultations
  async getInProgressConsultations(specialistId: string): Promise<ConsultationWithDetails[]> {
    return await getMany<ConsultationWithDetails>(
      `SELECT 
        c.id, c.appointment_id, c.client_id as patient_id, c.expert_id as specialist_id,
        c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.email as patient_email,
        p.phone_number as patient_phone,
        p.date_of_birth as patient_date_of_birth,
        a.appointment_date, a.start_time, a.end_time, a.reason_for_visit,
        e.display_name as specialist_name
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.id
      JOIN profiles p ON c.client_id = p.id
      JOIN experts e ON c.expert_id = e.id
      WHERE c.expert_id = ? AND c.status = 'in_progress'
      ORDER BY c.started_at DESC`,
      [specialistId]
    );
  },

  // Get completed consultations
  async getCompletedConsultations(specialistId: string): Promise<ConsultationWithDetails[]> {
    return await getMany<ConsultationWithDetails>(
      `SELECT 
        c.id, c.appointment_id, c.client_id as patient_id, c.expert_id as specialist_id,
        c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.email as patient_email,
        p.phone_number as patient_phone,
        p.date_of_birth as patient_date_of_birth,
        a.appointment_date, a.start_time, a.end_time, a.reason_for_visit,
        e.display_name as specialist_name
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.id
      JOIN profiles p ON c.client_id = p.id
      JOIN experts e ON c.expert_id = e.id
      WHERE c.expert_id = ? AND c.status = 'completed'
      ORDER BY c.ended_at DESC`,
      [specialistId]
    );
  },

  // Start a consultation (create record if needed, set to in_progress)
  async startConsultation(appointmentId: string, specialistId: string): Promise<string> {
    const appointment = await getOne<any>(
      `SELECT * FROM appointments WHERE id = ? AND specialist_id = ? AND status = 'CONFIRMED'`,
      [appointmentId, specialistId]
    );
    if (!appointment) throw new Error('Appointment not found or not confirmed');

    let consultation = await getOne<ConsultationRecord>(
      'SELECT * FROM consultations WHERE appointment_id = ?',
      [appointmentId]
    );

    if (consultation) {
      await executeAction(
        `UPDATE consultations SET status = 'in_progress', started_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
        [consultation.id]
      );
      return consultation.id;
    } else {
      const result = await executeAction(
        `INSERT INTO consultations (appointment_id, client_id, expert_id, status, started_at) 
         VALUES (?, ?, ?, 'in_progress', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
        [appointmentId, appointment.patient_id, specialistId]
      );
      
      const newConsultation = await getOne<ConsultationRecord>(
        'SELECT * FROM consultations WHERE appointment_id = ?',
        [appointmentId]
      );
      
      await ConsultationService.createNotification(
        appointment.patient_id,
        'Consultation Started',
        'Your consultation has been started. The specialist is now reviewing your case.',
        'consultation',
        `/patient/consultations`
      );
      
      return newConsultation?.id || '';
    }
  },

  // Get consultation by ID with full details
  async getConsultationById(id: string): Promise<ConsultationWithDetails | null> {
    return await getOne<ConsultationWithDetails>(
      `SELECT 
        c.id, c.appointment_id, c.client_id as patient_id, c.expert_id as specialist_id,
        c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.email as patient_email,
        p.phone_number as patient_phone,
        p.date_of_birth as patient_date_of_birth,
        a.appointment_date, a.start_time, a.end_time, a.reason_for_visit,
        e.display_name as specialist_name
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.id
      JOIN profiles p ON c.client_id = p.id
      JOIN experts e ON c.expert_id = e.id
      WHERE c.id = ?`,
      [id]
    );
  },

  // Get or create consultation notes
  async getConsultationNotes(consultationId: string): Promise<ConsultationNote | null> {
    return await getOne<ConsultationNote>(
      'SELECT * FROM consultation_notes WHERE consultation_id = ?',
      [consultationId]
    );
  },

  // Save consultation notes (upsert)
  async saveConsultationNotes(consultationId: string, notes: Partial<ConsultationNote>): Promise<void> {
    const existing = await this.getConsultationNotes(consultationId);
    
    if (existing) {
      await executeAction(
        `UPDATE consultation_notes SET 
          chief_complaint = ?, symptoms = ?, assessment = ?, 
          recommendations = ?, follow_up_required = ?, follow_up_date = ?
        WHERE consultation_id = ?`,
        [
          notes.chief_complaint || existing.chief_complaint,
          notes.symptoms || existing.symptoms,
          notes.assessment || existing.assessment,
          notes.recommendations || existing.recommendations,
          notes.follow_up_required ?? existing.follow_up_required,
          notes.follow_up_date || existing.follow_up_date,
          consultationId
        ]
      );
    } else {
      await executeAction(
        `INSERT INTO consultation_notes (consultation_id, chief_complaint, symptoms, assessment, recommendations, follow_up_required, follow_up_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          consultationId,
          notes.chief_complaint || null,
          notes.symptoms || null,
          notes.assessment || null,
          notes.recommendations || null,
          notes.follow_up_required || 0,
          notes.follow_up_date || null
        ]
      );
    }
  },

  // Complete a consultation
  async completeConsultation(consultationId: string, specialistId: string, notes: Partial<ConsultationNote>): Promise<void> {
    const consultation = await getOne<ConsultationRecord>(
      'SELECT * FROM consultations WHERE id = ? AND expert_id = ?',
      [consultationId, specialistId]
    );
    if (!consultation) throw new Error('Consultation not found');
    if (consultation.status === 'completed') throw new Error('Consultation already completed');

    await this.saveConsultationNotes(consultationId, notes);

    await executeAction(
      `UPDATE consultations SET status = 'completed', ended_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      [consultationId]
    );

    await executeAction(
      `UPDATE appointments SET status = 'COMPLETED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      [consultation.appointment_id]
    );

    let message = 'Your consultation has been completed. You can now view recommendations and follow-up instructions.';
    if (notes.follow_up_required) {
      message += ` A follow-up has been scheduled for ${notes.follow_up_date || 'a future date'}.`;
    }
    
    const patientId = (consultation.client_id || consultation.patient_id) as string;
    const specId = (consultation.expert_id || consultation.specialist_id || specialistId) as string;

    const patient = await getProfileById(patientId);
    const specialist = await getExpertById(specId);

    if (patient && patient.email && specialist) {
      await sendNotificationAndEmail({
        userId: patientId,
        emailTo: patient.email as string,
        emailSubject: "Elira Health - Consultation Completed",
        title: "Consultation Completed",
        message: message,
        type: "consultation",
        actionUrl: "/patient/consultations",
        emailTemplate: ConsultationCompletedEmail({
          name: patient.first_name as string,
          specialistName: specialist.display_name as string,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/patient/consultations`
        })
      });
    }
  },

  // Cancel a consultation
  async cancelConsultation(consultationId: string, specialistId: string): Promise<void> {
    await executeAction(
      `UPDATE consultations SET status = 'cancelled' WHERE id = ? AND expert_id = ?`,
      [consultationId, specialistId]
    );
  },

  // Dashboard metrics for specialist
  async getSpecialistConsultationMetrics(specialistId: string) {
    const [upcoming, inProgress, completed] = await Promise.all([
      getOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM appointments a
         LEFT JOIN consultations c ON c.appointment_id = a.id
         WHERE a.specialist_id = ? AND a.status = 'CONFIRMED'
           AND (c.status IS NULL OR c.status IN ('pending', 'confirmed', 'scheduled'))`,
        [specialistId]
      ),
      getOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM consultations WHERE expert_id = ? AND status = 'in_progress'`,
        [specialistId]
      ),
      getOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM consultations WHERE expert_id = ? AND status = 'completed'`,
        [specialistId]
      ),
    ]);
    return {
      upcoming: upcoming?.count || 0,
      inProgress: inProgress?.count || 0,
      completed: completed?.count || 0,
    };
  },

  // Patient consultations
  async getPatientConsultationHistory(patientId: string): Promise<(ConsultationWithDetails & { notes: ConsultationNote | null })[]> {
    const consultations = await getMany<ConsultationWithDetails>(
      `SELECT 
        c.id, c.appointment_id, c.client_id as patient_id, c.expert_id as specialist_id,
        c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.email as patient_email,
        p.phone_number as patient_phone,
        p.date_of_birth as patient_date_of_birth,
        a.appointment_date, a.start_time, a.end_time, a.reason_for_visit,
        e.display_name as specialist_name
      FROM consultations c
      JOIN appointments a ON c.appointment_id = a.id
      JOIN profiles p ON c.client_id = p.id
      JOIN experts e ON c.expert_id = e.id
      WHERE c.client_id = ?
      ORDER BY c.created_at DESC`,
      [patientId]
    );

    const results = [];
    for (const consultation of consultations) {
      let notes: ConsultationNote | null = null;
      if (consultation.status === 'completed') {
        notes = await this.getConsultationNotes(consultation.id);
      }
      results.push({ ...consultation, notes });
    }
    return results;
  },

  // Patient upcoming consultations (from confirmed appointments)
  async getPatientUpcomingConsultations(patientId: string): Promise<ConsultationWithDetails[]> {
    return await getMany<ConsultationWithDetails>(
      `SELECT 
        COALESCE(c.id, 'pending-' || a.id) as id,
        a.id as appointment_id,
        a.patient_id,
        a.specialist_id,
        COALESCE(c.status, 'scheduled') as status,
        c.started_at,
        c.ended_at,
        COALESCE(c.created_at, a.created_at) as created_at,
        COALESCE(c.updated_at, a.updated_at) as updated_at,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.email as patient_email,
        p.phone_number as patient_phone,
        p.date_of_birth as patient_date_of_birth,
        a.appointment_date, a.start_time, a.end_time, a.reason_for_visit,
        e.display_name as specialist_name
      FROM appointments a
      JOIN profiles p ON a.patient_id = p.id
      JOIN experts e ON a.specialist_id = e.id
      LEFT JOIN consultations c ON c.appointment_id = a.id
      WHERE a.patient_id = ?
        AND a.status = 'CONFIRMED'
        AND (c.status IS NULL OR c.status IN ('pending', 'confirmed', 'scheduled', 'in_progress'))
      ORDER BY a.appointment_date ASC, a.start_time ASC`,
      [patientId]
    );
  },

  // Notifications
  async createNotification(userId: string, title: string, message: string, type: string = 'info', link: string | null = null): Promise<void> {
    await executeAction(
      'INSERT INTO notifications (id, user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, title, message, 'system', link]
    );
  },

  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    return await getMany<Notification>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
  },

  async markNotificationRead(id: string): Promise<void> {
    await executeAction('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
  },

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await getOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return result?.count || 0;
  },
};
