import { createClient } from "@supabase/supabase-js";

export interface DoctorRegistrationData {
  full_name: string;
  email: string;
  password: string;
  license_number: string;
  specialization: string;
  hospital: string;
  years_experience: number;
}

export async function registerDoctor(data: DoctorRegistrationData) {
  // Use service role client to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // STEP 1: Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: data.full_name,
        role: "DOCTOR",
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user account");
    }

    const userId = authData.user.id;

    // STEP 2: Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: data.full_name,
      email: data.email,
      role: "DOCTOR",
    });

    if (profileError) {
      // Rollback: Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    // STEP 3: Insert into doctors table
    const { error: doctorError } = await supabase.from("doctors").insert({
      user_id: userId,
      license_number: data.license_number,
      specialization: data.specialization,
      hospital: data.hospital,
      years_experience: data.years_experience,
      bio: null,
      consultation_fee: 0,
      verification_status: "PENDING",
      is_available: false,
    });

    if (doctorError) {
      // Rollback: Delete profile and auth user if doctor creation fails
      await supabase.from("profiles").delete().eq("id", userId);
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(`Doctor profile creation failed: ${doctorError.message}`);
    }

    return {
      success: true,
      userId,
      message: "Registration successful! Please wait for admin verification.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}
