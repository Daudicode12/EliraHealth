import { getExpertByUserId } from "@/lib/db/queries";
import { AppointmentService } from "@/services/appointment.service";
import { ConsultationService } from "@/services/consultation.service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, ShieldCheck, ChevronRight, Lock, Activity, Users, Calendar } from "lucide-react";

export default async function SpecialistDashboard() {
  const token = (await cookies()).get("auth-token")?.value;
  let userId = token?.replace("mock-token-", "");
  if (token?.startsWith("mock-jwt-")) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
      userId = decoded.id;
    } catch(e) {}
  }

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const [appointmentMetrics, consultationMetrics] = await Promise.all([
    AppointmentService.getSpecialistDashboardMetrics(doctor.id),
    ConsultationService.getSpecialistConsultationMetrics(doctor.id),
  ]);

  function calculateProfileCompletion(doc: any) {
    const fields = [
      !!doc.display_name,
      !!doc.avatar_url,
      !!doc.bio,
      !!doc.specialties && doc.specialties !== '[]',
      !!doc.license_number && !!doc.medical_council_number && !!doc.practicing_certificate_url,
      doc.years_of_experience !== null && doc.years_of_experience !== undefined,
      !!doc.hospital_name,
      doc.hourly_rate !== null && doc.hourly_rate !== undefined,
    ];
    
    const completedFields = fields.filter(Boolean).length;
    const totalFields = fields.length;
    return {
      completionPercentage: Math.round((completedFields / totalFields) * 100),
      completedFields,
      totalFields
    };
  }

  const completion = calculateProfileCompletion(doctor);
  let rawStatus = doctor.profile_status || 'profile_incomplete';
  
  // Mapping statuses
  let status = "profile_incomplete";
  if (rawStatus === 'pending_review') status = "pending_approval";
  if (rawStatus === 'approved') status = "approved";
  if (rawStatus === 'rejected') status = "rejected";

  const isLocked = status !== 'approved';

  const appointmentCards = [
    { label: "Today's Appointments", value: appointmentMetrics.todayAppointments, color: "blue", href: "/specialist/appointments", icon: "📅" },
    { label: "Upcoming Appointments", value: appointmentMetrics.upcomingAppointments, color: "emerald", href: "/specialist/appointments", icon: "🗓️" },
    { label: "Completed Appointments", value: appointmentMetrics.completedAppointments, color: "violet", href: "/specialist/appointments", icon: "✔️" },
  ];

  const consultationCards = [
    { label: "Upcoming Consultations", value: consultationMetrics.upcoming, color: "blue", href: "/specialist/consultations?tab=upcoming", icon: "📋" },
    { label: "In Progress", value: consultationMetrics.inProgress, color: "amber", href: "/specialist/consultations?tab=in_progress", icon: "⏳" },
    { label: "Completed Consultations", value: consultationMetrics.completed, color: "green", href: "/specialist/consultations?tab=completed", icon: "✅" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ONBOARDING BANNER */}
      {status === "profile_incomplete" && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="mt-1 bg-amber-500/20 p-2 rounded-full h-fit">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-900">Complete Your Professional Profile</h2>
              <p className="text-amber-800/80 mt-1 max-w-2xl text-sm leading-relaxed">
                Your profile is incomplete. Add your credentials and professional information so our administrators can review and verify your account. You will not be able to accept appointments until verification is complete.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-full max-w-xs bg-amber-500/20 rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${completion.completionPercentage}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-amber-700">Profile Completion: {completion.completionPercentage}%</span>
              </div>
            </div>
          </div>
          <Link href="/specialist/profile" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
            Complete Profile <ChevronRight size={18} />
          </Link>
        </div>
      )}

      {/* TOP SECTION: Welcome & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Welcome Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 bg-white/5 w-32 h-32 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-indigo-200 font-medium mb-2">Welcome back,</p>
            <h1 className="text-3xl font-bold text-white leading-tight">Dr. {doctor.display_name || "Specialist"}</h1>
            <p className="text-indigo-200 mt-2 text-sm max-w-xs">Manage your appointments and consultations from your clinical workspace.</p>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Verification Status</h3>
          
          {status === "profile_incomplete" && (
            <div className="flex gap-4 items-start">
              <div className="bg-slate-100 p-3 rounded-2xl"><ShieldAlert className="text-slate-400" size={28} /></div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 mb-2">Profile Incomplete</span>
                <p className="text-sm text-slate-600">Complete your profile to submit credentials for review.</p>
              </div>
            </div>
          )}

          {status === "pending_approval" && (
            <div className="flex gap-4 items-start">
              <div className="bg-yellow-50 p-3 rounded-2xl"><Clock className="text-yellow-500" size={28} /></div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200 mb-2">Pending Review</span>
                <p className="text-sm text-slate-600">Your credentials have been submitted. Our administrators are reviewing your profile.</p>
              </div>
            </div>
          )}

          {status === "approved" && (
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-50 p-3 rounded-2xl"><ShieldCheck className="text-emerald-500" size={28} /></div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 mb-2">Verified Specialist</span>
                <p className="text-sm text-slate-600">Your profile has been verified. You have full access to consultations and appointments.</p>
              </div>
            </div>
          )}

          {status === "rejected" && (
            <div className="flex gap-4 items-start">
              <div className="bg-red-50 p-3 rounded-2xl"><AlertTriangle className="text-red-500" size={28} /></div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 mb-2">Review Required</span>
                <p className="text-sm text-slate-600">Your profile requires updates before approval. Please review the feedback and resubmit.</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Completion Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex justify-between">
            Profile Completion
            <span className="text-indigo-600">{completion.completedFields}/{completion.totalFields}</span>
          </h3>
          <div className="flex flex-col gap-3">
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${completion.completionPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                style={{ width: `${completion.completionPercentage}%` }}>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {completion.completionPercentage === 100 
                ? "Excellent! Your profile is fully complete." 
                : "Add more details to boost patient trust and visibility."}
            </p>
          </div>
        </div>

      </div>

      {/* METRICS SECTION */}
      
      {isLocked ? (
        <div className="mt-12">
          <div className="bg-slate-100/50 border border-slate-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-3xl mx-auto">
            <div className="bg-slate-200/50 p-4 rounded-full mb-4">
              <Lock className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">
              {status === "profile_incomplete" ? "Complete your profile first." : "Awaiting administrator approval."}
            </h3>
            <p className="text-slate-500 mt-2 max-w-md text-sm">
              Appointments, consultations, and availability management are locked until your clinical credentials have been verified by our team.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          {/* Appointment Metrics */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-indigo-500" />
              Appointments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {appointmentCards.map((card) => (
                <Link key={card.label} href={card.href} className="block group">
                  <div className="rounded-2xl border border-slate-200 p-5 bg-white group-hover:border-indigo-300 group-hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                        <p className={`text-3xl font-bold mt-1 text-${card.color}-600`}>{card.value}</p>
                      </div>
                      <span className="text-2xl opacity-80">{card.icon}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Consultation Metrics */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Activity size={20} className="text-indigo-500" />
              Consultations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {consultationCards.map((card) => (
                <Link key={card.label} href={card.href} className="block group">
                  <div className="rounded-2xl border border-slate-200 p-5 bg-white group-hover:border-indigo-300 group-hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                        <p className={`text-3xl font-bold mt-1 text-${card.color}-600`}>{card.value}</p>
                      </div>
                      <span className="text-2xl opacity-80">{card.icon}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
