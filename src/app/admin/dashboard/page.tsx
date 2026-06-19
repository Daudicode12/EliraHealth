import { getOne } from "@/lib/db/queries";
import { Users, UserPlus, Stethoscope, CalendarCheck, FileStack, ShieldAlert } from "lucide-react";

export default async function AdminDashboard() {
  const [
    totalDoctorsResult,
    pendingResult,
    consultationsResult
  ] = await Promise.all([
    getOne<{ count: number }>('SELECT COUNT(*) as count FROM experts'),
    getOne<{ count: number }>("SELECT COUNT(*) as count FROM experts WHERE profile_status = 'pending_review'"),
    getOne<{ count: number }>("SELECT COUNT(*) as count FROM consultations")
  ]);

  const totalDoctors = totalDoctorsResult?.count ?? 0;
  const pending = pendingResult?.count ?? 0;
  const consultations = consultationsResult?.count ?? 0;

  const stats = [
    { 
      label: "Total Specialists", 
      value: totalDoctors, 
      icon: Stethoscope,
      bg: "bg-gradient-to-br from-purple-500 to-indigo-600",
      trend: "+12% this month" 
    },
    { 
      label: "Pending Approvals", 
      value: pending, 
      icon: ShieldAlert,
      bg: "bg-gradient-to-br from-amber-400 to-orange-500",
      trend: "Requires attention" 
    },
    { 
      label: "Total Appointments", 
      value: consultations, 
      icon: CalendarCheck,
      bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      trend: "+24% this week" 
    },
    { 
      label: "Active Patients", 
      value: "1,204", 
      icon: Users,
      bg: "bg-gradient-to-br from-blue-400 to-sky-500",
      trend: "+5% this month" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, Admin</h1>
          <p className="text-slate-500 mt-1">Here's what's happening in Elira Health today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            Review Pending
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, bg, trend }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110 ${bg}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl text-white shadow-sm ${bg}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
              <p className="text-xs font-medium text-slate-400 mt-3 flex items-center gap-1">
                {trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileStack className="text-purple-600" />
              Recent Activity
            </h2>
          </div>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
              <CalendarCheck className="text-slate-400" size={32} />
            </div>
            <h3 className="text-slate-900 font-medium">No alerts today</h3>
            <p className="text-slate-500 text-sm mt-1">The system is running smoothly.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <UserPlus className="text-emerald-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a href="/admin/doctors?tab=pending" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <ShieldAlert size={18} />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900">Verify Doctors</span>
              </div>
              <span className="text-slate-400">&rarr;</span>
            </a>
            <a href="/admin/appointments" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CalendarCheck size={18} />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-slate-900">All Appointments</span>
              </div>
              <span className="text-slate-400">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
