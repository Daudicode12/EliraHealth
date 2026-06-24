// src/app/specialist/dashboard/page.tsx
import { getExpertByUserId } from "@/lib/db/queries";
import { getSpecialistDashboardStats } from "@/lib/db/specialistQueries";
import { AppointmentService } from "@/services/appointment.service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, FileText, CalendarCheck, Clock, Stethoscope, ShieldCheck, Sparkles, Lock } from "lucide-react";

export default async function DoctorDashboard() {
  const token = (await cookies()).get("auth-token")?.value;
  let userId = '';
  
  if (token) {
    const payloadStr = token.replace("mock-jwt-", "").replace("mock-token-", "");
    try {
      if (token.startsWith("mock-jwt-")) {
        const decoded = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
        userId = decoded.id;
      } else {
        userId = payloadStr;
      }
    } catch (e) {
      userId = payloadStr;
    }
  }

  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  const profileStatus = doctor.profile_status || 'profile_incomplete';

  let stats = { totalAssignedPatients: 0, totalMedicalRecords: 0, totalConsultations: 0 };
  let appointmentMetrics = { todayAppointments: 0, upcomingAppointments: 0 };

  if (profileStatus === 'approved') {
    try {
      const [s, a] = await Promise.all([
        getSpecialistDashboardStats(doctor.id),
        AppointmentService.getSpecialistDashboardMetrics(doctor.id)
      ]);
      stats = {
        totalAssignedPatients: s?.totalAssignedPatients || 0,
        totalMedicalRecords: s?.totalMedicalRecords || 0,
        totalConsultations: s?.totalConsultations || 0,
      };
      appointmentMetrics = a;
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }

  const widgets = [
    { 
      label: "Today's Schedule", 
      value: appointmentMetrics.todayAppointments, 
      icon: Clock,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/specialist/appointments",
      isLocked: profileStatus !== 'approved'
    },
    { 
      label: "Upcoming Appointments", 
      value: appointmentMetrics.upcomingAppointments, 
      icon: CalendarCheck,
      bg: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/specialist/appointments",
      isLocked: profileStatus !== 'approved'
    },
    { 
      label: "Total Patients", 
      value: stats.totalAssignedPatients, 
      icon: Users,
      bg: "bg-purple-50 text-purple-600 border-purple-100",
      link: "/specialist/patients",
      isLocked: profileStatus !== 'approved'
    },
    { 
      label: "Medical Records", 
      value: stats.totalMedicalRecords, 
      icon: FileText,
      bg: "bg-amber-50 text-amber-600 border-amber-100",
      link: "/specialist/medical-records",
      isLocked: profileStatus !== 'approved'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'profile_incomplete':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            🟡 Profile Incomplete
          </span>
        );
      case 'pending_review':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            🟠 Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            🟢 Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            🔴 Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            ⚫ Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const getSpecialtyDisplay = () => {
    try {
      const parsed = JSON.parse(doctor.specialties || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.join(', ');
      }
    } catch(e) {}
    return "Credentials Incomplete";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Onboarding State Banners */}
      {profileStatus === 'profile_incomplete' && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Sparkles size={200} />
          </div>
          <div className="max-w-xl space-y-4">
            <h2 className="text-2xl font-bold">Complete Your Professional Profile</h2>
            <p className="text-purple-100 font-medium">
              Your account has been created successfully. Before you can accept patients and appointments,
              you must complete your professional credentials.
            </p>
            <a 
              href="/specialist/profile/complete" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Complete Profile
            </a>
          </div>
        </div>
      )}

      {profileStatus === 'pending_review' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Clock size={200} />
          </div>
          <div className="max-w-xl space-y-4">
            <h2 className="text-2xl font-bold">Awaiting Verification</h2>
            <p className="text-amber-100 font-medium">
              Your credentials have been submitted and are currently under review.
              Estimated review time: 24 - 48 hours.
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
          <Stethoscope size={160} className="-mr-10 -mt-10" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold border-2 border-white shadow-md">
            {doctor.display_name?.charAt(0) || '?'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, Dr. {doctor.display_name?.split(' ').pop()}</h1>
              {getStatusBadge(profileStatus)}
            </div>
            <p className="text-slate-500 mt-1 font-medium">{getSpecialtyDisplay()}</p>
          </div>
        </div>
        {profileStatus === 'approved' && (
          <div className="relative z-10 flex gap-3">
            <a href="/specialist/medical-records?new=select" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm inline-block">
              + New Record
            </a>
            <a href="/specialist/availability" className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors shadow-sm inline-block">
              Manage Availability
            </a>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map(({ label, value, icon: Icon, bg, link, isLocked }) => {
          const content = (
            <div className={`relative rounded-2xl bg-white p-6 shadow-sm border border-slate-200 transition-all duration-300 ${
              isLocked 
                ? 'opacity-70 bg-slate-50/50' 
                : 'hover:shadow-lg hover:border-emerald-200'
            }`}>
              {isLocked && (
                <div className="absolute top-3 right-3 text-slate-400" title="Requires profile verification">
                  <Lock size={16} />
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${bg}`}>
                  <Icon size={24} />
                </div>
                {!isLocked && <span className="text-slate-300">&rarr;</span>}
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{isLocked ? "—" : value}</h3>
            </div>
          );

          if (isLocked) {
            return <div key={label}>{content}</div>;
          }

          return (
            <a key={label} href={link} className="block group">
              {content}
            </a>
          );
        })}
      </div>

      {/* Workspace Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clinical Summary */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="text-blue-500" />
              Clinical Summary
            </h2>
            {profileStatus === 'approved' && (
              <a href="/specialist/appointments" className="text-sm text-emerald-600 font-medium hover:underline">View Schedule</a>
            )}
          </div>
          
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
              {profileStatus === 'approved' ? (
                <Clock className="text-slate-400" size={32} />
              ) : (
                <Lock className="text-slate-400" size={32} />
              )}
            </div>
            {profileStatus === 'approved' ? (
              <>
                <h3 className="text-slate-900 font-medium">Your schedule is clear</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">You have no immediate appointments. Use this time to review patient records or update your availability.</p>
              </>
            ) : (
              <>
                <h3 className="text-slate-900 font-medium">Clinical Workspace Locked</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                  Please complete your professional credentials and wait for account verification to unlock your clinical workspace.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Widgets (Messages) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Messages</h2>
            </div>
            <div className="text-sm text-slate-500 text-center py-8">
              No new messages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
