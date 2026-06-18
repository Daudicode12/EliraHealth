import { getExpertByUserId } from "@/lib/db/queries";
import { getSpecialistDashboardStats } from "@/lib/db/specialistQueries";
import { AppointmentService } from "@/services/appointment.service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, FileText, CalendarCheck, Clock, Stethoscope, Banknote, ShieldCheck } from "lucide-react";

export default async function DoctorDashboard() {
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

  const [stats, appointmentMetrics] = await Promise.all([
    getSpecialistDashboardStats(doctor.id),
    AppointmentService.getSpecialistDashboardMetrics(doctor.id)
  ]);

  const widgets = [
    { 
      label: "Today's Schedule", 
      value: appointmentMetrics.todayAppointments, 
      icon: Clock,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/doctor/appointments"
    },
    { 
      label: "Upcoming Appointments", 
      value: appointmentMetrics.upcomingAppointments, 
      icon: CalendarCheck,
      bg: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/doctor/appointments"
    },
    { 
      label: "Total Patients", 
      value: stats.totalAssignedPatients, 
      icon: Users,
      bg: "bg-purple-50 text-purple-600 border-purple-100",
      link: "/doctor/patients"
    },
    { 
      label: "Medical Records", 
      value: stats.totalMedicalRecords, 
      icon: FileText,
      bg: "bg-amber-50 text-amber-600 border-amber-100",
      link: "/doctor/medical-records"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
          <Stethoscope size={160} className="-mr-10 -mt-10" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold border-2 border-white shadow-md">
            {doctor.display_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, Dr. {doctor.display_name.split(' ').pop()}</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck size={12} />
                Verified
              </span>
            </div>
            <p className="text-slate-500 mt-1 font-medium">{JSON.parse(doctor.specialties || '[]').join(', ')}</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3">
          <a href="/doctor/medical-records?new=select" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm inline-block">
            + New Record
          </a>
          <a href="/doctor/availability" className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors shadow-sm inline-block">
            Manage Availability
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map(({ label, value, icon: Icon, bg, link }) => (
          <a key={label} href={link} className="block group">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${bg}`}>
                  <Icon size={24} />
                </div>
                <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">&rarr;</span>
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
            </div>
          </a>
        ))}
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
            <a href="/doctor/appointments" className="text-sm text-emerald-600 font-medium hover:underline">View Schedule</a>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
              <Clock className="text-slate-400" size={32} />
            </div>
            <h3 className="text-slate-900 font-medium">Your schedule is clear</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">You have no immediate appointments. Use this time to review patient records or update your availability.</p>
          </div>
        </div>

        {/* Sidebar Widgets (Earnings & Messages) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Banknote className="text-emerald-500" />
              Earnings
            </h2>
            <div className="text-center py-6 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">This Month</p>
              <h3 className="text-3xl font-bold text-slate-900">KES 0.00</h3>
              <p className="text-xs text-emerald-600 font-medium mt-2">Available in future update</p>
            </div>
          </div>

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
