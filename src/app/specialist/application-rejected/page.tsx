import { getServerSession } from '@/lib/auth/server-session';
// src/app/specialist/application-rejected/page.tsx
import { getExpertByUserId } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AlertOctagon, ArrowRight, UserCog, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";

export default async function ApplicationRejectedPage() {
  const session = await getServerSession();
  const userId = session?.userId;

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  // If status is not rejected, redirect to dashboard
  if (doctor.profile_status !== 'rejected') {
    redirect("/specialist/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-md text-center space-y-6 animate-in fade-in duration-300">
        
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <AlertOctagon size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Application Rejected</h1>
          <p className="text-slate-500 text-sm">
            Unfortunately, your application to join Elira Health as a specialist has been rejected by our administration team.
          </p>
        </div>

        {/* Rejection Reason Card */}
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 text-left space-y-2">
          <label className="text-xs font-bold text-red-700 uppercase tracking-wider">Reason for rejection:</label>
          <p className="text-slate-800 text-sm font-medium italic">
            "{doctor.rejection_reason || "No specific reason provided. Please contact support."}"
          </p>
        </div>

        <p className="text-slate-500 text-xs">
          You may review and update your clinical credentials to resubmit your application for verification.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <a
            href="/specialist/profile/complete"
            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-brand hover:bg-brand-deep active:bg-brand-deep text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
          >
            <UserCog size={18} />
            Update Profile & Resubmit
            <ArrowRight size={16} />
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
