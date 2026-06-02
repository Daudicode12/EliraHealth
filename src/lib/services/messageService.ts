import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SenderRole } from "@/types";

export async function getMessages(consultationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function sendMessage(data: {
  consultation_id: string;
  sender_id: string;
  sender_role: SenderRole;
  message: string;
  attachment_url?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from("messages")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return created;
}
