import { logoutAction } from "@/lib/actions/auth.actions";
import { DoctorSidebar } from "@/components/layout/DoctorSidebar";
import { getExpertByUserId } from "@/lib/db/queries";
import { getServerSession } from "@/lib/auth/session";
import { Clock, LogOut, CheckCircle2, ShieldCheck, Sparkles, Mail } from "lucide-react";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  const expert = session ? await getExpertByUserId(session.id) : null;
  const profileStatus = expert?.profile_status || 'profile_incomplete';

  if (profileStatus === 'pending_review') {
    return (
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 md:p-6 overflow-hidden font-sans">
        {/* Background decorative elements for rich aesthetics */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />

        <div className="relative max-w-lg w-full bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Animated Status Indicator */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-brand/5 animate-ping duration-1000" />
            <div className="absolute inset-2 rounded-full bg-brand-blue/10 animate-pulse" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-blue text-white flex items-center justify-center shadow-lg shadow-brand/20">
              <ShieldCheck size={26} />
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-pink/10 text-brand-pink border border-brand-pink/10">
              <Sparkles size={11} />
              Reviewing Credentials
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Awaiting Verification
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              We are manually verifying your registration details and credentials to activate your specialist account.
            </p>
          </div>

          {/* Verification Timeline/Checklist */}
          <div className="bg-slate-50/70 border border-slate-200/50 rounded-2xl p-5 text-left space-y-4">
            <h3 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Verification Checklist</h3>
            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-emerald-700">
                  <CheckCircle2 size={12} className="stroke-[3px]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Specialist Profile Completed</p>
                  <p className="text-[11px] text-slate-500">Your clinical profile data and biography have been received.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 mt-0.5 text-brand relative">
                  <span className="absolute inset-0 rounded-full bg-brand/20 animate-ping" />
                  <Clock size={12} className="animate-spin-slow" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Credential Auditing
                    <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-brand/10 text-brand uppercase tracking-wider animate-pulse">Verifying</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Verifying qualifications, board certification, and registry status.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-400">
                  <ShieldCheck size={12} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Account Activation</p>
                  <p className="text-[11px] text-slate-500">Final board approval and opening of the specialist dashboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support Reassurance Box */}
          <div className="bg-brand-pink/5 border border-brand-pink/10 rounded-2xl p-5 text-left flex items-start gap-3">
            <Mail className="text-brand-pink shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-[10px] font-extrabold text-brand-pink uppercase tracking-wider">Estimated Processing Time</h4>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Verification is usually completed within <strong>24 - 48 hours</strong>. You will receive an email once approved. For urgent requests, write to <span className="font-semibold text-brand">support@elira-health.com</span>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100">
            <form action={logoutAction}>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer border border-slate-200/50 shadow-sm"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <DoctorSidebar logoutAction={logoutAction} profileStatus={profileStatus} />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
