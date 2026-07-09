// src/app/user/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/db/queries";
import { logoutAction } from "@/lib/actions/auth.actions";
import Link from "next/link";

export const metadata = {
  title: "User Dashboard - Elira Health",
  description: "View your health logs, tracking data, and consultations",
};

export default async function UserDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let profileName = "User";
  let profileEmail = "";

  try {
    const payloadStr = token.replace("mock-jwt-", "");
    const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    if (decoded?.id) {
      const profile = await getProfileById(decoded.id);
      if (profile) {
        profileName = `${profile.first_name} ${profile.last_name}`;
        profileEmail = profile.email || "";
      }
    }
  } catch (error) {
    console.error("Dashboard profile load error:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Banner/Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-deep flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
            E
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Elira Mama Care</h1>
            <p className="text-xs text-muted-foreground">Health Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{profileName}</p>
            <p className="text-xs text-muted-foreground">{profileEmail}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-brand/10 via-brand-pink/5 to-white border border-brand/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950">
              Welcome back, {profileName.split(" ")[0]}!
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Track your daily wellness logs, consult with certified medical experts, and keep record of your maternal progress securely.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-brand hover:bg-brand-deep text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              Log Today's Symptoms
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
              Book Doctor
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Menstrual Health Tracking */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
                Cycle Tracking
              </span>
              <span className="text-xs text-muted-foreground">Updated today</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Day 14</h3>
              <p className="text-sm font-medium text-slate-700 mt-1">Ovulation Phase (Fertile Window)</p>
              <p className="text-xs text-muted-foreground mt-2">
                Your next cycle is predicted to start in approximately 14 days.
              </p>
            </div>
            <div className="pt-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-brand h-full rounded-full w-[50%]" />
              </div>
            </div>
          </div>

          {/* Card 2: Upcoming Consultations */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Consultations
              </span>
              <span className="text-xs text-slate-400">0 Scheduled</span>
            </div>
            <div className="py-2 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                📅
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No upcoming meetings</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Need professional advice? Request a match or schedule an appointment.
                </p>
              </div>
            </div>
            <button className="w-full border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 py-2.5 rounded-lg transition-colors cursor-pointer">
              Schedule Specialist Match
            </button>
          </div>

          {/* Card 3: Medical Records */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-pink/10 text-brand-pink">
                Medical Records
              </span>
              <span className="text-xs text-slate-400">Protected</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">General Treatment Record</p>
                    <p className="text-[10px] text-slate-400">No records found</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💊</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Prescriptions</p>
                    <p className="text-[10px] text-slate-400">No active medications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support CTA Banner */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
              🏥
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Access to 24/7 Clinical Network Support</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our support team and on-duty general practitioners are always here to guide you.
              </p>
            </div>
          </div>
          <a
            href="mailto:support@elirahealth.com"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 flex-shrink-0"
          >
            Contact Support &rarr;
          </a>
        </div>
      </main>
    </div>
  );
}
