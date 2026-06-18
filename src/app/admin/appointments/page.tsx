import { AppointmentService } from "@/services/appointment.service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Calendar, CheckCircle, Clock, XCircle, UserX, AlertCircle } from "lucide-react";

const STATUS_ICONS: Record<string, any> = {
  PENDING: <Clock size={14} className="text-yellow-600" />,
  CONFIRMED: <CheckCircle size={14} className="text-blue-600" />,
  COMPLETED: <CheckCircle size={14} className="text-green-600" />,
  CANCELLED: <XCircle size={14} className="text-red-600" />,
  NO_SHOW: <UserX size={14} className="text-gray-600" />,
  RESCHEDULED: <AlertCircle size={14} className="text-orange-600" />,
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  NO_SHOW: "bg-gray-50 text-gray-700 border-gray-200",
  RESCHEDULED: "bg-orange-50 text-orange-700 border-orange-200",
};

export default async function AdminAppointmentsPage() {
  const token = (await cookies()).get("auth-token")?.value;
  let adminId = token?.replace("mock-token-", "") || 'system';
  if (token?.startsWith("mock-jwt-")) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
      adminId = decoded.id;
      if (decoded.role !== 'admin') redirect("/login");
    } catch(e) {}
  } else {
    redirect("/login");
  }

  const [stats, appointments] = await Promise.all([
    AppointmentService.getAppointmentStats(),
    AppointmentService.getAllAppointments({}, 100, 0)
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-blue-600" />
            All Appointments
          </h1>
          <p className="text-slate-500 mt-1">Monitor all patient and specialist appointments across the platform.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.totalAppointments, color: "text-slate-900", bg: "bg-slate-50" },
          { label: "Pending", value: stats.pendingAppointments, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Confirmed", value: stats.confirmedAppointments, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", value: stats.completedAppointments, color: "text-green-600", bg: "bg-green-50" },
          { label: "Cancelled", value: stats.cancelledAppointments, color: "text-red-600", bg: "bg-red-50" },
          { label: "No Shows", value: stats.noShowAppointments, color: "text-gray-600", bg: "bg-gray-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-50 ${stat.bg}`} />
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color} relative z-10`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <h2 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Recent Appointments</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-slate-50/30">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              There are currently no appointments scheduled in the system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Specialist</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt: any) => (
                  <tr key={appt.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {appt.patient_first_name} {appt.patient_last_name}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      Dr. {appt.specialist_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{new Date(appt.appointment_date).toLocaleDateString()}</div>
                      <div className="text-slate-500 text-xs font-medium mt-0.5">{appt.start_time} - {appt.end_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${STATUS_STYLES[appt.status]}`}>
                        {STATUS_ICONS[appt.status]}
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate" title={appt.reason_for_visit}>
                      {appt.reason_for_visit || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
