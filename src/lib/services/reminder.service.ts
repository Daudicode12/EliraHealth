import { getMany, executeAction } from '../db/client';
import { sendNotificationAndEmail, createNotification } from './notification.service';
import { getProfileById, getExpertById } from '../db/queries';
import ConsultationReminderEmail from '../email/templates/consultation-reminder';
import * as React from 'react';

export async function processReminders() {
  const now = new Date();
  
  // 1. Appointments exactly 24 hours from now
  const next24hStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const next24hStartStr = next24hStart.toISOString().slice(0, 16);
  
  // 2. Appointments exactly 1 hour from now
  const next1hStart = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const next1hStartStr = next1hStart.toISOString().slice(0, 16);

  // Note: For simplicity in SQLite/Turso, we query upcoming appointments and check the diff in Node, 
  // or use SQL datetime functions. We will query CONFIRMED appointments in the next 25 hours.
  
  const upcomingAppointments = await getMany<any>(`
    SELECT * FROM appointments 
    WHERE status = 'CONFIRMED' 
      AND appointment_date >= date('now')
      AND appointment_date <= date('now', '+2 days')
  `);

  for (const appt of upcomingAppointments) {
    const apptDateTimeStr = `${appt.appointment_date}T${appt.start_time}:00Z`;
    const apptDateTime = new Date(apptDateTimeStr);
    const diffMs = apptDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Check 24 hours reminder
    if (diffHours > 23.5 && diffHours <= 24.5) {
      await sendReminder(appt, '24 hours');
    }
    // Check 1 hour reminder
    else if (diffHours > 0.5 && diffHours <= 1.5) {
      await sendReminder(appt, '1 hour');
    }
  }
}

async function sendReminder(appt: any, timeRemaining: string) {
  // Prevent duplicate reminders by checking notifications table
  const existing = await getMany(
    `SELECT id FROM notifications WHERE user_id = ? AND type = 'reminder' AND message LIKE ? AND created_at > datetime('now', '-2 hours')`,
    [appt.patient_id, `%${timeRemaining}%`]
  );
  
  if (existing.length > 0) return; // Already sent

  const patient = await getProfileById(appt.patient_id);
  const specialist = await getExpertById(appt.specialist_id);

  if (patient && patient.email && specialist) {
    await sendNotificationAndEmail({
      userId: appt.patient_id,
      emailTo: patient.email as string,
      emailSubject: `Reminder: Consultation in ${timeRemaining}`,
      title: "Consultation Reminder",
      message: `Your consultation with Dr. ${specialist.display_name} starts in ${timeRemaining}.`,
      type: "reminder",
      actionUrl: "/patient/consultations",
      emailTemplate: ConsultationReminderEmail({
        name: patient.first_name as string,
        specialistName: specialist.display_name as string,
        timeRemaining,
        date: appt.appointment_date,
        time: appt.start_time,
        meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/patient/consultations`
      })
    });
  }
}
