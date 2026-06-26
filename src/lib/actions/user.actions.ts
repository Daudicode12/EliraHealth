"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { executeAction, getOne, getMany } from "@/lib/db/client";
import { AppointmentService } from "@/services/appointment.service";

/**
 * Reusable helper to retrieve the logged-in user's ID from the mock-jwt auth-token cookie.
 */
async function getAuthenticatedUserId(): Promise<string> {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) throw new Error("Not authenticated");
  
  const payloadStr = token.replace("mock-jwt-", "");
  try {
    const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    return decoded.id;
  } catch (e) {
    throw new Error("Invalid session token");
  }
}

/**
 * Save onboarding mode (tracking, pregnant, postpartum) and insert initial journey records.
 */
export async function setOnboardingModeAction(data: {
  mode: "tracking" | "pregnant" | "postpartum";
  averageCycleLength?: number;
  averagePeriodLength?: number;
  conceptionDate?: string;
  expectedDueDate?: string;
  babyNickname?: string;
  babyGender?: "unknown" | "boy" | "girl";
  deliveryDate?: string;
  babyName?: string;
  babyBirthWeight?: number;
  babyBirthLength?: number;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    if (data.mode === "tracking") {
      await executeAction(
        `UPDATE profiles 
         SET current_cycle_mode = 'tracking', 
             average_cycle_length = ?, 
             average_period_length = ? 
         WHERE id = ?`,
        [data.averageCycleLength || 28, data.averagePeriodLength || 5, userId]
      );
    } else if (data.mode === "pregnant") {
      if (!data.conceptionDate) {
        return { success: false, error: "Conception date is required for pregnancy tracking." };
      }
      
      let expectedDue = data.expectedDueDate;
      if (!expectedDue) {
        // Calculate due date (conception date + 266 days / last period + 280 days)
        const dateObj = new Date(data.conceptionDate);
        dateObj.setDate(dateObj.getDate() + 266);
        expectedDue = dateObj.toISOString().split("T")[0];
      }
      
      // Clear existing pregnancies
      await executeAction("DELETE FROM pregnancies WHERE user_id = ?", [userId]);
      
      // Insert new pregnancy
      await executeAction(
        `INSERT INTO pregnancies (
          user_id, conception_date, expected_due_date, pregnancy_start_date, 
          baby_nickname, baby_gender, pregnancy_status, weight_gain_kg
        ) VALUES (?, ?, ?, ?, ?, ?, 'ongoing', 0.0)`,
        [
          userId, 
          data.conceptionDate, 
          expectedDue, 
          data.conceptionDate, // start date
          data.babyNickname || "Baby", 
          data.babyGender || "unknown"
        ]
      );
      
      await executeAction(
        `UPDATE profiles SET current_cycle_mode = 'pregnant' WHERE id = ?`,
        [userId]
      );
    } else if (data.mode === "postpartum") {
      if (!data.deliveryDate) {
        return { success: false, error: "Delivery date is required for postpartum tracking." };
      }
      
      // Clear existing postpartum journeys
      await executeAction("DELETE FROM postpartum_journeys WHERE user_id = ?", [userId]);
      
      // Insert new postpartum journey
      await executeAction(
        `INSERT INTO postpartum_journeys (
          user_id, delivery_date, baby_name, baby_birth_weight_kg, baby_birth_length_cm
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          userId, 
          data.deliveryDate, 
          data.babyName || "Baby", 
          data.babyBirthWeight || null, 
          data.babyBirthLength || null
        ]
      );
      
      await executeAction(
        `UPDATE profiles SET current_cycle_mode = 'postpartum' WHERE id = ?`,
        [userId]
      );
    }
    
    // Update Auth Cookie to include active state
    const payload = Buffer.from(JSON.stringify({
      id: userId,
      role: 'user',
      status: 'active'
    })).toString('base64');
    
    (await cookies()).set("auth-token", `mock-jwt-${payload}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Onboarding action error:", error);
    return { success: false, error: error.message || "Failed to set onboarding mode." };
  }
}

/**
 * Get or create a pending partner invitation code for sharing.
 */
export async function getOrCreatePartnerInvitationAction(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  
  // Check for existing pending code
  const existing = await getOne<{ invitation_code: string }>(
    `SELECT invitation_code FROM partner_invitations 
     WHERE invited_by_user_id = ? AND status = 'pending' AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
     LIMIT 1`,
    [userId]
  );
  
  if (existing) {
    return existing.invitation_code;
  }
  
  // Generate random 6-character alphanumeric code
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitted easily confused letters
  let code = "ELIRA-";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days
  
  await executeAction(
    `INSERT INTO partner_invitations (invited_by_user_id, invitation_code, status, expires_at) 
     VALUES (?, ?, 'pending', ?)`,
    [userId, code, expiresAt.toISOString()]
  );
  
  return code;
}

/**
 * Partner matching action. Connects a partner using an invitation code.
 */
export async function partnerConnectAction(code: string) {
  try {
    const userId = await getAuthenticatedUserId();
    
    // Find invitation
    const invitation = await getOne<{ id: string; invited_by_user_id: string }>(
      `SELECT * FROM partner_invitations 
       WHERE invitation_code = ? AND status = 'pending' AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
       LIMIT 1`,
      [code.trim().toUpperCase()]
    );
    
    if (!invitation) {
      return { success: false, error: "Invalid or expired invitation code." };
    }
    
    const pregnantPartnerId = invitation.invited_by_user_id;
    
    if (pregnantPartnerId === userId) {
      return { success: false, error: "You cannot match with yourself." };
    }
    
    // Check if relationship already exists
    const existing = await getOne(
      "SELECT id FROM partners WHERE (user_id = ? AND partner_id = ?) OR (user_id = ? AND partner_id = ?)",
      [pregnantPartnerId, userId, userId, pregnantPartnerId]
    );
    
    if (!existing) {
      // Connect them
      await executeAction(
        `INSERT INTO partners (user_id, partner_id, relationship_status, share_cycle_data, share_pregnancy_status, share_symptoms) 
         VALUES (?, ?, 'active', 1, 1, 1)`,
        [pregnantPartnerId, userId]
      );
    }
    
    // Mark code as accepted
    await executeAction(
      "UPDATE partner_invitations SET status = 'accepted' WHERE id = ?",
      [invitation.id]
    );
    
    // Update partner's mode
    await executeAction(
      "UPDATE profiles SET current_cycle_mode = 'partner' WHERE id = ?",
      [userId]
    );
    
    // Refresh auth cookie
    const payload = Buffer.from(JSON.stringify({
      id: userId,
      role: 'user',
      status: 'active'
    })).toString('base64');
    
    (await cookies()).set("auth-token", `mock-jwt-${payload}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    
    // Trigger generating initial insights
    await generatePartnerInsights(pregnantPartnerId, userId);
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Partner connect error:", error);
    return { success: false, error: error.message || "Failed to link partner." };
  }
}

/**
 * Log standard cycle symptom
 */
export async function logCycleSymptomAction(data: {
  date: string;
  type: string;
  severity: number;
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    await executeAction(
      `INSERT OR REPLACE INTO symptoms (user_id, date, symptom_type, severity, value, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, data.date, data.type, data.severity, data.severity.toString(), data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log cycle symptom error:", error);
    return { success: false, error: error.message || "Failed to log symptom." };
  }
}

/**
 * Log pregnancy symptom
 */
export async function logPregnancySymptomAction(data: {
  date: string;
  pregnancyId: string;
  week: number;
  type: string;
  severity: number;
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    await executeAction(
      `INSERT INTO pregnancy_symptoms (user_id, pregnancy_id, date, week_of_pregnancy, symptom_type, severity, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.pregnancyId, data.date, data.week, data.type, data.severity, data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log pregnancy symptom error:", error);
    return { success: false, error: error.message || "Failed to log pregnancy symptom." };
  }
}

/**
 * Log baby kick counts
 */
export async function logBabyKickAction(data: {
  pregnancyId: string;
  sessionCount: number;
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    await executeAction(
      `INSERT INTO baby_kicks (user_id, pregnancy_id, session_count, notes) 
       VALUES (?, ?, ?, ?)`,
      [userId, data.pregnancyId, data.sessionCount, data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log baby kicks error:", error);
    return { success: false, error: error.message || "Failed to log kicks." };
  }
}

/**
 * Log postpartum feeding session
 */
export async function logFeedingSessionAction(data: {
  journeyId: string;
  method: "breast" | "bottle" | "combination" | "solid";
  side?: "left" | "right" | "both";
  amountMl?: number;
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    const now = new Date().toISOString();
    
    await executeAction(
      `INSERT INTO feeding_sessions (user_id, postpartum_journey_id, start_time, end_time, method, breast_side, amount_ml, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.journeyId, now, now, data.method, data.side || null, data.amountMl || null, data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log feeding error:", error);
    return { success: false, error: error.message || "Failed to log feeding session." };
  }
}

/**
 * Log baby sleep session
 */
export async function logBabySleepAction(data: {
  journeyId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    await executeAction(
      `INSERT INTO baby_sleep (user_id, postpartum_journey_id, start_time, end_time, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.journeyId, data.startTime, data.endTime, data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log baby sleep error:", error);
    return { success: false, error: error.message || "Failed to log baby sleep." };
  }
}

/**
 * Log baby weight
 */
export async function logBabyWeightAction(data: {
  journeyId: string;
  date: string;
  weightKg: number;
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    await executeAction(
      `INSERT INTO baby_weights (user_id, postpartum_journey_id, record_date, weight_kg, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.journeyId, data.date, data.weightKg, data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log baby weight error:", error);
    return { success: false, error: error.message || "Failed to log weight." };
  }
}

/**
 * Log mother's postpartum mood record
 */
export async function logMoodRecordAction(data: {
  journeyId: string;
  date: string;
  mood: "great" | "good" | "okay" | "low" | "struggling";
  notes?: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    await executeAction(
      `INSERT INTO mood_records (user_id, postpartum_journey_id, record_date, mood, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, data.journeyId, data.date, data.mood, data.notes || null]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Log mood error:", error);
    return { success: false, error: error.message || "Failed to log mood." };
  }
}

/**
 * Book an appointment (used by standard patient dashboard or by partner booking on patient's behalf)
 */
export async function bookAppointmentAction(data: {
  patientId: string;
  specialistId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reasonForVisit: string;
}) {
  try {
    const bookedBy = await getAuthenticatedUserId();
    
    await AppointmentService.createAppointment({
      patientId: data.patientId,
      specialistId: data.specialistId,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      endTime: data.endTime,
      reasonForVisit: data.reasonForVisit
    }, bookedBy);
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Book appointment action error:", error);
    return { success: false, error: error.message || "Failed to schedule appointment." };
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointmentAction(appointmentId: string) {
  try {
    await getAuthenticatedUserId(); // verify auth
    await AppointmentService.cancelAppointment(appointmentId);
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Cancel appointment error:", error);
    return { success: false, error: error.message || "Failed to cancel appointment." };
  }
}

/**
 * Send a message to matched partner
 */
export async function sendPartnerMessageAction(content: string) {
  try {
    const userId = await getAuthenticatedUserId();
    
    // Find partner relation
    const partner = await getOne<{ partner_id: string; user_id: string }>(
      `SELECT * FROM partners WHERE user_id = ? OR partner_id = ? LIMIT 1`,
      [userId, userId]
    );
    
    if (!partner) {
      return { success: false, error: "No connected partner found." };
    }
    
    const receiverId = partner.user_id === userId ? partner.partner_id : partner.user_id;
    
    await executeAction(
      `INSERT INTO messages (sender_id, receiver_id, content, message_type, is_read) 
       VALUES (?, ?, ?, 'text', 0)`,
      [userId, receiverId, content]
    );
    
    revalidatePath("/user/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Send partner message error:", error);
    return { success: false, error: error.message || "Failed to send message." };
  }
}

/**
 * Helper to generate partner insights based on patient data.
 */
async function generatePartnerInsights(pregnantPartnerId: string, partnerUserId: string) {
  try {
    // Check partner's mode
    const partnerProfile = await getOne<{ current_cycle_mode: string }>(
      "SELECT current_cycle_mode FROM profiles WHERE id = ?",
      [pregnantPartnerId]
    );
    
    if (!partnerProfile) return;
    
    const today = new Date().toISOString().split("T")[0];
    
    if (partnerProfile.current_cycle_mode === "pregnant") {
      const pregnancy = await getOne<{ conception_date: string }>(
        "SELECT conception_date FROM pregnancies WHERE user_id = ?",
        [pregnantPartnerId]
      );
      
      if (pregnancy) {
        const days = Math.floor((Date.now() - new Date(pregnancy.conception_date).getTime()) / (1000 * 60 * 60 * 24));
        const weeks = Math.max(1, Math.min(42, Math.floor(days / 7) + 2)); // Adjusted for gestational weeks (+2 weeks)
        
        let message = `She is currently in Week ${weeks} of pregnancy. `;
        if (weeks <= 12) {
          message += "During the first trimester, morning sickness and extreme fatigue are common. Make sure she has plenty of crackers, ginger tea, and gets lots of rest!";
        } else if (weeks <= 27) {
          message += "The second trimester often brings a surge of energy! Plan some light date nights or help set up the nursery. Watch out for joint aches and support her posture.";
        } else {
          message += "The third trimester is here. Baby is growing fast, which can cause back pain, rib kicks, and shortness of breath. Help out with chores and ensure she stays comfortable.";
        }
        
        await executeAction(
          `INSERT INTO partner_insights (user_id, partner_id, insight_date, insight_type, message, severity, is_read) 
           VALUES (?, ?, ?, 'pregnancy_week', ?, 'info', 0)`,
          [pregnantPartnerId, partnerUserId, today, message]
        );
      }
    } else if (partnerProfile.current_cycle_mode === "postpartum") {
      const baby = await getOne<{ delivery_date: string; baby_name: string }>(
        "SELECT delivery_date, baby_name FROM postpartum_journeys WHERE user_id = ?",
        [pregnantPartnerId]
      );
      
      if (baby) {
        const name = baby.baby_name || "the baby";
        const message = `Postpartum recovery is a major physical and emotional transition. Help with feeding ${name}, log diapers, and encourage her to rest. Watch out for signs of baby blues or postpartum anxiety.`;
        
        await executeAction(
          `INSERT INTO partner_insights (user_id, partner_id, insight_date, insight_type, message, severity, is_read) 
           VALUES (?, ?, ?, 'offer_extra_support', ?, 'high', 0)`,
          [pregnantPartnerId, partnerUserId, today, message]
        );
      }
    } else {
      // tracking
      const message = "Her menstrual cycle tracking is active. Keep an eye out for PMDD or general fatigue before her period. Offer comforting support like a warm heating pad or her favorite herbal tea!";
      await executeAction(
        `INSERT INTO partner_insights (user_id, partner_id, insight_date, insight_type, message, severity, is_read) 
         VALUES (?, ?, ?, 'offer_extra_support', ?, 'mild', 0)`,
        [pregnantPartnerId, partnerUserId, today, message]
      );
    }
  } catch (err) {
    console.error("Error generating partner insights:", err);
  }
}
