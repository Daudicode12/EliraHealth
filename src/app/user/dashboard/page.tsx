// src/app/user/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileById, getOne, getMany } from "@/lib/db/queries";
import { logoutAction } from "@/lib/actions/auth.actions";
import { UserDashboardClient } from "@/components/dashboard/UserDashboardClient";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = {
  title: "User Dashboard - Elira Mama Care",
  description: "Manage your health tracking logs, baby metrics, partner synchronizations, and consult medical specialists.",
};

export default async function UserDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userId = "";
  try {
    const payloadStr = token.replace("mock-jwt-", "");
    const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    userId = decoded?.id || "";
  } catch (error) {
    console.error("Dashboard session decoding error:", error);
    redirect("/login");
  }

  if (!userId) {
    redirect("/login");
  }

  // Load core user profile
  const profile = await getProfileById(userId);
  if (!profile) {
    redirect("/login");
  }

  // Fetch verified experts
  const experts = await getMany<any>(
    "SELECT id, display_name, specialties, hospital_name, avatar_url FROM experts WHERE profile_status = 'approved'"
  );

  // Initialize modes and connection variables
  let appointments: any[] = [];
  let connectedPartner: any = null;
  let cycleSymptoms: any[] = [];
  let pregnancySymptoms: any[] = [];
  let babyKicks: any[] = [];
  let feedingSessions: any[] = [];
  let babySleepLogs: any[] = [];
  let babyWeightLogs: any[] = [];
  let moodRecords: any[] = [];
  let partnerInsights: any[] = [];
  let pregnancyDetails: any = null;
  let postpartumDetails: any = null;
  let partnerCode: string | null = null;

  // Resolve partner status and upcoming appointments
  if (profile.current_cycle_mode === "partner") {
    // Current user is the partner, look up connected patient (mother)
    const link = await getOne<any>(
      `SELECT p.*, prof.first_name, prof.last_name, prof.email, prof.current_cycle_mode as partner_mode, prof.id as partner_user_id 
       FROM partners p 
       JOIN profiles prof ON p.user_id = prof.id 
       WHERE p.partner_id = ? LIMIT 1`,
      [userId]
    );
    if (link) {
      connectedPartner = link;
      appointments = await getMany<any>(
        `SELECT a.*, e.display_name as specialist_name 
         FROM appointments a 
         JOIN experts e ON a.specialist_id = e.id 
         WHERE a.patient_id = ? 
         ORDER BY a.appointment_date ASC, a.start_time ASC`,
        [link.user_id]
      );
    }
  } else {
    // Current user is the patient (tracking/pregnant/postpartum)
    appointments = await getMany<any>(
      `SELECT a.*, e.display_name as specialist_name 
       FROM appointments a 
       JOIN experts e ON a.specialist_id = e.id 
       WHERE a.patient_id = ? 
       ORDER BY a.appointment_date ASC, a.start_time ASC`,
      [userId]
    );

    // Look up if they have any connected partner
    const link = await getOne<any>(
      `SELECT p.*, prof.first_name, prof.last_name, prof.email 
       FROM partners p 
       JOIN profiles prof ON p.partner_id = prof.id 
       WHERE p.user_id = ? LIMIT 1`,
      [userId]
    );
    if (link) {
      connectedPartner = link;
    }
  }

  // Load mode-specific details
  if (profile.current_cycle_mode === "tracking") {
    cycleSymptoms = await getMany<any>(
      "SELECT * FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 10",
      [userId]
    );
    const invitation = await getOne<{ invitation_code: string }>(
      "SELECT invitation_code FROM partner_invitations WHERE invited_by_user_id = ? AND status = 'pending' LIMIT 1",
      [userId]
    );
    partnerCode = invitation?.invitation_code || null;

  } else if (profile.current_cycle_mode === "pregnant") {
    pregnancyDetails = await getOne<any>(
      "SELECT * FROM pregnancies WHERE user_id = ? AND pregnancy_status = 'ongoing' LIMIT 1",
      [userId]
    );
    if (pregnancyDetails) {
      pregnancySymptoms = await getMany<any>(
        "SELECT * FROM pregnancy_symptoms WHERE user_id = ? AND pregnancy_id = ? ORDER BY date DESC LIMIT 10",
        [userId, pregnancyDetails.id]
      );
      babyKicks = await getMany<any>(
        "SELECT * FROM baby_kicks WHERE user_id = ? AND pregnancy_id = ? ORDER BY logged_at DESC LIMIT 10",
        [userId, pregnancyDetails.id]
      );
    }
    const invitation = await getOne<{ invitation_code: string }>(
      "SELECT invitation_code FROM partner_invitations WHERE invited_by_user_id = ? AND status = 'pending' LIMIT 1",
      [userId]
    );
    partnerCode = invitation?.invitation_code || null;

  } else if (profile.current_cycle_mode === "postpartum") {
    postpartumDetails = await getOne<any>(
      "SELECT * FROM postpartum_journeys WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (postpartumDetails) {
      feedingSessions = await getMany<any>(
        "SELECT * FROM feeding_sessions WHERE user_id = ? AND postpartum_journey_id = ? ORDER BY start_time DESC LIMIT 10",
        [userId, postpartumDetails.id]
      );
      babySleepLogs = await getMany<any>(
        "SELECT * FROM baby_sleep WHERE user_id = ? AND postpartum_journey_id = ? ORDER BY start_time DESC LIMIT 10",
        [userId, postpartumDetails.id]
      );
      babyWeightLogs = await getMany<any>(
        "SELECT * FROM baby_weights WHERE user_id = ? AND postpartum_journey_id = ? ORDER BY record_date DESC LIMIT 10",
        [userId, postpartumDetails.id]
      );
      moodRecords = await getMany<any>(
        "SELECT * FROM mood_records WHERE user_id = ? AND postpartum_journey_id = ? ORDER BY record_date DESC LIMIT 10",
        [userId, postpartumDetails.id]
      );
    }
    const invitation = await getOne<{ invitation_code: string }>(
      "SELECT invitation_code FROM partner_invitations WHERE invited_by_user_id = ? AND status = 'pending' LIMIT 1",
      [userId]
    );
    partnerCode = invitation?.invitation_code || null;

  } else if (profile.current_cycle_mode === "partner" && connectedPartner) {
    const partnerId = connectedPartner.partner_user_id;
    partnerInsights = await getMany<any>(
      "SELECT * FROM partner_insights WHERE partner_id = ? ORDER BY insight_date DESC LIMIT 5",
      [userId]
    );

    if (connectedPartner.partner_mode === "pregnant") {
      pregnancyDetails = await getOne<any>(
        "SELECT * FROM pregnancies WHERE user_id = ? AND pregnancy_status = 'ongoing' LIMIT 1",
        [partnerId]
      );
      if (pregnancyDetails) {
        pregnancySymptoms = await getMany<any>(
          "SELECT * FROM pregnancy_symptoms WHERE user_id = ? AND pregnancy_id = ? ORDER BY date DESC LIMIT 10",
          [partnerId, pregnancyDetails.id]
        );
      }
    } else if (connectedPartner.partner_mode === "postpartum") {
      postpartumDetails = await getOne<any>(
        "SELECT * FROM postpartum_journeys WHERE user_id = ? LIMIT 1",
        [partnerId]
      );
      if (postpartumDetails) {
        moodRecords = await getMany<any>(
          "SELECT * FROM mood_records WHERE user_id = ? AND postpartum_journey_id = ? ORDER BY record_date DESC LIMIT 10",
          [partnerId, postpartumDetails.id]
        );
      }
    } else if (connectedPartner.partner_mode === "tracking") {
      cycleSymptoms = await getMany<any>(
        "SELECT * FROM symptoms WHERE user_id = ? ORDER BY date DESC LIMIT 10",
        [partnerId]
      );
    }
  }

  const profileName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User";
  const profileEmail = profile.email || "";

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Banner/Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-deep flex items-center justify-center text-white shadow-md shadow-brand/20 transition-transform group-hover:scale-105">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Elira Mama Care</h1>
              <p className="text-xs text-muted-foreground font-medium">Patient Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{profileName}</p>
            <p className="text-xs text-muted-foreground font-semibold">{profileEmail}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:translate-y-0"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        <UserDashboardClient
          profile={{
            id: profile.id,
            email: profile.email || null,
            first_name: profile.first_name || null,
            last_name: profile.last_name || null,
            role: profile.role,
            phone_number: profile.phone_number || null,
            current_cycle_mode: profile.current_cycle_mode || null,
          }}
          experts={experts}
          appointments={appointments}
          partnerCode={partnerCode}
          connectedPartner={connectedPartner ? {
            first_name: connectedPartner.first_name,
            last_name: connectedPartner.last_name,
            email: connectedPartner.email,
            partner_mode: connectedPartner.partner_mode || "",
            partner_user_id: connectedPartner.partner_user_id || "",
          } : null}
          cycleSymptoms={cycleSymptoms}
          pregnancySymptoms={pregnancySymptoms}
          babyKicks={babyKicks}
          feedingSessions={feedingSessions}
          babySleepLogs={babySleepLogs}
          babyWeightLogs={babyWeightLogs}
          moodRecords={moodRecords}
          partnerInsights={partnerInsights}
          pregnancyDetails={pregnancyDetails}
          postpartumDetails={postpartumDetails}
        />
      </main>
    </div>
  );
}
