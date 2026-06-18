import { executeAction, getOne, getMany } from '@/lib/db/client';
import { Appointment, CreateAppointmentInput, AppointmentStats, AppointmentStatus } from '@/lib/types/appointment';

export class AppointmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppointmentError';
  }
}

export const AppointmentService = {
  
  /**
   * Validates if the appointment date is in the future.
   */
  validateFutureDate(date: string, time: string) {
    const appointmentDateTime = new Date(`${date}T${time}:00Z`);
    if (appointmentDateTime <= new Date()) {
      throw new AppointmentError("Appointment must be scheduled in the future.");
    }
  },

  /**
   * Checks if the specialist is available on the given day and time.
   */
  async checkSpecialistAvailability(specialistId: string, date: string, startTime: string, endTime: string) {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayOfWeek = new Date(date).getUTCDay();
    
    // Check expert_availability table
    const sql = `
      SELECT id FROM expert_availability 
      WHERE expert_id = ? 
        AND day_of_week = ? 
        AND start_time <= ? 
        AND end_time >= ?
    `;
    const available = await getOne(sql, [specialistId, dayOfWeek, startTime, endTime]);
    
    if (!available) {
      throw new AppointmentError("Selected time is outside the specialist's availability schedule.");
    }
  },

  /**
   * Rule 2: A specialist cannot have two appointments at the same time.
   */
  async checkSpecialistConflict(specialistId: string, date: string, startTime: string, endTime: string, excludeId?: string) {
    let sql = `
      SELECT id FROM appointments 
      WHERE specialist_id = ? 
        AND appointment_date = ? 
        AND start_time < ? 
        AND end_time > ? 
        AND status NOT IN ('CANCELLED', 'REJECTED')
    `;
    const params: any[] = [specialistId, date, endTime, startTime];

    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }

    const conflict = await getOne(sql, params);
    if (conflict) {
      throw new AppointmentError("Specialist already has an appointment during this time.");
    }
  },

  /**
   * Rule 1: A patient cannot book two appointments that overlap.
   */
  async checkPatientConflict(patientId: string, date: string, startTime: string, endTime: string, excludeId?: string) {
    let sql = `
      SELECT id FROM appointments 
      WHERE patient_id = ? 
        AND appointment_date = ? 
        AND start_time < ? 
        AND end_time > ? 
        AND status NOT IN ('CANCELLED', 'REJECTED')
    `;
    const params: any[] = [patientId, date, endTime, startTime];

    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }

    const conflict = await getOne(sql, params);
    if (conflict) {
      throw new AppointmentError("Patient already has an appointment during this time.");
    }
  },

  async createAppointment(data: CreateAppointmentInput, bookedBy: string): Promise<string> {
    this.validateFutureDate(data.appointmentDate, data.startTime);
    await this.checkSpecialistAvailability(data.specialistId, data.appointmentDate, data.startTime, data.endTime);
    await this.checkSpecialistConflict(data.specialistId, data.appointmentDate, data.startTime, data.endTime);
    await this.checkPatientConflict(data.patientId, data.appointmentDate, data.startTime, data.endTime);

    const result = await executeAction(
      `INSERT INTO appointments (
        patient_id, specialist_id, appointment_date, start_time, end_time, reason_for_visit, status, booked_by
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [data.patientId, data.specialistId, data.appointmentDate, data.startTime, data.endTime, data.reasonForVisit || null, bookedBy]
    );

    return result.lastInsertRowid?.toString() || '';
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    await executeAction(
      `UPDATE appointments SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      [status, id]
    );
  },

  async cancelAppointment(id: string): Promise<void> {
    await this.updateAppointmentStatus(id, 'CANCELLED');
  },

  async confirmAppointment(id: string): Promise<void> {
    await this.updateAppointmentStatus(id, 'CONFIRMED');
  },

  async completeAppointment(id: string): Promise<void> {
    await this.updateAppointmentStatus(id, 'COMPLETED');
  },

  async markNoShow(id: string): Promise<void> {
    await this.updateAppointmentStatus(id, 'NO_SHOW');
  },

  async rescheduleAppointment(id: string, newDate: string, newStart: string, newEnd: string): Promise<void> {
    const appointment = await getOne<Appointment>(`SELECT * FROM appointments WHERE id = ?`, [id]);
    if (!appointment) throw new AppointmentError("Appointment not found");

    this.validateFutureDate(newDate, newStart);
    await this.checkSpecialistAvailability(appointment.specialist_id, newDate, newStart, newEnd);
    await this.checkSpecialistConflict(appointment.specialist_id, newDate, newStart, newEnd, id);
    await this.checkPatientConflict(appointment.patient_id, newDate, newStart, newEnd, id);

    await executeAction(
      `UPDATE appointments 
       SET appointment_date = ?, start_time = ?, end_time = ?, status = 'RESCHEDULED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
       WHERE id = ?`,
      [newDate, newStart, newEnd, id]
    );
  },

  async getPatientAppointments(patientId: string, limit = 50, offset = 0) {
    return await getMany(
      `SELECT a.*, e.display_name as specialist_name, p.first_name as patient_first_name, p.last_name as patient_last_name
       FROM appointments a
       JOIN experts e ON a.specialist_id = e.id
       JOIN profiles p ON a.patient_id = p.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.start_time DESC
       LIMIT ? OFFSET ?`,
      [patientId, limit, offset]
    );
  },

  async getSpecialistAppointments(specialistId: string, filters?: { status?: string, date?: string }, limit = 50, offset = 0) {
    let sql = `
      SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, p.email as patient_email
      FROM appointments a
      JOIN profiles p ON a.patient_id = p.id
      WHERE a.specialist_id = ?
    `;
    const params: any[] = [specialistId];

    if (filters?.status) {
      sql += ` AND a.status = ?`;
      params.push(filters.status);
    }
    if (filters?.date) {
      sql += ` AND a.appointment_date = ?`;
      params.push(filters.date);
    }

    sql += ` ORDER BY a.appointment_date ASC, a.start_time ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await getMany(sql, params);
  },

  async getAllAppointments(filters?: { status?: string, specialistId?: string, patientId?: string }, limit = 50, offset = 0) {
    let sql = `
      SELECT a.*, 
             e.display_name as specialist_name, 
             p.first_name as patient_first_name, 
             p.last_name as patient_last_name
      FROM appointments a
      JOIN experts e ON a.specialist_id = e.id
      JOIN profiles p ON a.patient_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
      sql += ` AND a.status = ?`;
      params.push(filters.status);
    }
    if (filters?.specialistId) {
      sql += ` AND a.specialist_id = ?`;
      params.push(filters.specialistId);
    }
    if (filters?.patientId) {
      sql += ` AND a.patient_id = ?`;
      params.push(filters.patientId);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await getMany(sql, params);
  },

  async getAppointmentStats(): Promise<AppointmentStats> {
    const rawStats = await getMany<{ status: string, count: number }>(`
      SELECT status, COUNT(*) as count FROM appointments GROUP BY status
    `);
    
    let total = 0;
    const mapped: any = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0, RESCHEDULED: 0 };
    
    rawStats.forEach(row => {
      mapped[row.status] = row.count;
      total += row.count;
    });

    return {
      totalAppointments: total,
      pendingAppointments: mapped['PENDING'] || 0,
      confirmedAppointments: mapped['CONFIRMED'] || 0,
      completedAppointments: mapped['COMPLETED'] || 0,
      cancelledAppointments: mapped['CANCELLED'] || 0,
      noShowAppointments: mapped['NO_SHOW'] || 0,
    };
  },

  async getSpecialistDashboardMetrics(specialistId: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const [todayRes, upcomingRes, completedRes] = await Promise.all([
      getOne<{ count: number }>(`SELECT COUNT(*) as count FROM appointments WHERE specialist_id = ? AND appointment_date = ? AND status NOT IN ('CANCELLED', 'NO_SHOW')`, [specialistId, today]),
      getOne<{ count: number }>(`SELECT COUNT(*) as count FROM appointments WHERE specialist_id = ? AND appointment_date > ? AND status NOT IN ('CANCELLED', 'NO_SHOW')`, [specialistId, today]),
      getOne<{ count: number }>(`SELECT COUNT(*) as count FROM appointments WHERE specialist_id = ? AND status = 'COMPLETED'`, [specialistId])
    ]);

    return {
      todayAppointments: todayRes?.count || 0,
      upcomingAppointments: upcomingRes?.count || 0,
      completedAppointments: completedRes?.count || 0,
    };
  }
};
