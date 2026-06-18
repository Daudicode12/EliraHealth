import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getApprovedDoctors() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("*, profiles(full_name, avatar_url, email)")
    .eq("verification_status", "APPROVED")
    .eq("is_available", true);
  if (error) throw new Error(error.message);
  return data;
}

export async function getDoctorById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("*, profiles(full_name, avatar_url, email), doctor_availability(*)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getDoctorByUserId(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("*, profiles(*), doctor_availability(*)")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
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
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("doctors")
    .update(fields)
    .eq("id", doctorId);
  if (error) throw new Error(error.message);
}

export async function updateDoctorVerification(
  doctorId: string,
  verification_status: "APPROVED" | "REJECTED" | "PENDING"
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("doctors")
    .update({ verification_status })
    .eq("id", doctorId);
  if (error) throw new Error(error.message);
}

export async function upsertAvailability(
  doctorId: string,
  slots: { day: string; start_time: string; end_time: string }[]
) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("doctor_availability").delete().eq("doctor_id", doctorId);
  if (slots.length === 0) return;
  const { error } = await supabase
    .from("doctor_availability")
    .insert(slots.map((s) => ({ ...s, doctor_id: doctorId })));
  if (error) throw new Error(error.message);
}
