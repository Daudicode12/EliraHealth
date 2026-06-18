"use server";

import { 
  approveExpert, 
  updateConsultationStatus, 
  getPatientRecord 
} from "@/lib/db/queries";
import { revalidatePath } from "next/cache";

export async function approveExpertAction(expertId: string) {
  await approveExpert(expertId);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function approveConsultationAction(consultationId: string) {
  await updateConsultationStatus(consultationId, 'confirmed');
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getPatientRecordAction(patientId: string) {
  return await getPatientRecord(patientId);
}
