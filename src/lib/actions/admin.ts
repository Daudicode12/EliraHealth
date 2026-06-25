"use server";

import { 
  approveExpert, 
  rejectExpert,
  requestMoreInfoExpert,
  updateConsultationStatus, 
  getPatientRecord,
  updateExpert,
  getExpertById
} from "@/lib/db/queries";
import { executeAction } from "@/lib/db/client";
import { AppointmentService } from "@/services/appointment.service";
import { revalidatePath } from "next/cache";

export async function approveExpertAction(expertId: string) {
  await approveExpert(expertId, 'admin-action');
  revalidatePath("/admin/doctors");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function rejectExpertAction(expertId: string, reason: string) {
  await rejectExpert(expertId, reason);
  revalidatePath("/admin/doctors");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function requestMoreInfoAction(expertId: string, reason: string) {
  await requestMoreInfoExpert(expertId, reason);
  revalidatePath("/admin/doctors");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updateDoctorDetailsAction(expertId: string, data: any) {
  // Update the fields in the experts table
  const expertFields: any = {};
  if (data.display_name !== undefined) expertFields.display_name = data.display_name;
  if (data.bio !== undefined) expertFields.bio = data.bio;
  if (data.hospital_name !== undefined) expertFields.hospital_name = data.hospital_name;
  if (data.years_of_experience !== undefined) expertFields.years_of_experience = Number(data.years_of_experience);
  if (data.hourly_rate !== undefined) expertFields.hourly_rate = Number(data.hourly_rate);
  if (data.specialties !== undefined) expertFields.specialties = typeof data.specialties === 'string' ? data.specialties : JSON.stringify(data.specialties);
  if (data.sub_specialties !== undefined) expertFields.sub_specialties = typeof data.sub_specialties === 'string' ? data.sub_specialties : JSON.stringify(data.sub_specialties);
  if (data.languages !== undefined) expertFields.languages = typeof data.languages === 'string' ? data.languages : JSON.stringify(data.languages);
  if (data.license_number !== undefined) expertFields.license_number = data.license_number;
  if (data.medical_council_number !== undefined) expertFields.medical_council_number = data.medical_council_number;

  await updateExpert(expertId, expertFields);

  // If email or phone number is provided, update the profiles table
  if (data.email !== undefined || data.phone_number !== undefined) {
    const expert = await getExpertById(expertId);
    if (expert) {
      const profileFields: string[] = [];
      const params: any[] = [];
      if (data.email !== undefined) {
        profileFields.push("email = ?");
        params.push(data.email);
      }
      if (data.phone_number !== undefined) {
        profileFields.push("phone_number = ?");
        params.push(data.phone_number);
      }
      
      if (profileFields.length > 0) {
        params.push(expert.user_id);
        await executeAction(
          `UPDATE profiles SET ${profileFields.join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
          params
        );
      }
    }
  }

  revalidatePath("/admin/doctors");
  return { success: true };
}

export async function approveConsultationAction(consultationId: string) {
  await updateConsultationStatus(consultationId, 'confirmed');
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function rejectConsultationAction(consultationId: string, reason: string) {
  await executeAction(
    `UPDATE consultations 
     SET status = 'cancelled', 
         cancellation_reason = ?, 
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
     WHERE id = ?`,
    [reason, consultationId]
  );
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function approveAppointmentAction(appointmentId: string) {
  await AppointmentService.confirmAppointment(appointmentId);
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function rejectAppointmentAction(appointmentId: string) {
  await AppointmentService.cancelAppointment(appointmentId);
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getPatientRecordAction(patientId: string) {
  return await getPatientRecord(patientId);
}
