import { getServerSession } from '@/lib/auth/server-session';
// src/app/specialist/account-suspended/page.tsx
import { getExpertByUserId } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShieldAlert, Mail } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";

export default async function AccountSuspendedPage() {
  const session = await getServerSession();
  const userId = session?.userId;

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  // If status is not suspended, redirect to dashboard
  if (doctor.profile_status !== 'suspended') {
    redirect("/specialist/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-md text-center space-y-6 animate-in fade-in duration-300">
        
        <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-sm animate-bounce">
          <ShieldAlert size={32} className="text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Account Suspended</h1>
          <p className="text-slate-500 text-sm">
            Your specialist account has been suspended by the platform administration team.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-left flex items-start gap-3">
          <Mail className="text-slate-400 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Need Assistance?</h4>
            <p className="text-slate-500 text-xs mt-1">
              Please contact our support desk at <span className="font-semibold text-brand">support@elira-health.com</span> to request activation or clarify account queries.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col gap-2">
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
