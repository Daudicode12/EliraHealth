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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">All Appointments</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.totalAppointments, color: "text-gray-900" },
          { label: "Pending", value: stats.pendingAppointments, color: "text-yellow-600" },
          { label: "Confirmed", value: stats.confirmedAppointments, color: "text-blue-600" },
          { label: "Completed", value: stats.completedAppointments, color: "text-green-600" },
          { label: "Cancelled", value: stats.cancelledAppointments, color: "text-red-600" },
          { label: "No Shows", value: stats.noShowAppointments, color: "text-gray-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3 border-b">Patient</th>
                  <th className="px-6 py-3 border-b">Specialist</th>
                  <th className="px-6 py-3 border-b">Date & Time</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt: any) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {appt.patient_first_name} {appt.patient_last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      Dr. {appt.specialist_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{new Date(appt.appointment_date).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs">{appt.start_time} - {appt.end_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[appt.status]}`}>
                        {STATUS_ICONS[appt.status]}
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate" title={appt.reason_for_visit}>
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
