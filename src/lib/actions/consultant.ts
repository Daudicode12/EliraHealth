"use server";

import { 
  createConsultation, 
  sendConsultationMessage, 
  createReview 
} from "@/lib/db/queries";
import { Consultation } from "@/lib/db/types";
import { revalidatePath } from "next/cache";

export async function bookConsultation(data: Partial<Consultation>) {
  await createConsultation(data);
  revalidatePath("/patient/dashboard");
  return { success: true };
}

export async function sendMessage(consultationId: string, senderId: string, content: string) {
  await sendConsultationMessage({
    consultation_id: consultationId,
    sender_id: senderId,
    content,
    message_type: 'text'
  });
  revalidatePath(`/consultations/${consultationId}`);
  return { success: true };
}

export async function submitReview(consultationId: string, clientId: string, expertId: string, rating: number, comment: string) {
  await createReview({
    consultation_id: consultationId,
    client_id: clientId,
    expert_id: expertId,
    rating,
    comment
  });
  revalidatePath(`/experts/${expertId}`);
  return { success: true };
}
