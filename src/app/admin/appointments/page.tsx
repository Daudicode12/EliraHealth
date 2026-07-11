import { getServerSession } from "@/lib/auth/server-session";
import { AppointmentService } from "@/services/appointment.service";
import { getAllConsultations } from "@/lib/db/queries";
import { 
  approveAppointmentAction, 
  rejectAppointmentAction,
  approveConsultationAction,
  rejectConsultationAction
} from "@/lib/actions/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, CheckCircle, Clock, XCircle, UserX, AlertCircle, MessageSquare } from "lucide-react";
import { ExpandableApprovalCard } from "@/components/admin/ExpandableApprovalCard";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const token = (await cookies()).get("auth-token")?.value;
  const session = await getServerSession();
  let userId = session?.userId || 'system';
  if (!userId) {
    redirect("/login");
  }
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "appointments";

  // Actions
  async function handleApproveAppointment(id: string) {
    "use server";
    await approveAppointmentAction(id);
  }

  async function handleRejectAppointment(id: string) {
    "use server";
    await rejectAppointmentAction(id);
  }

  async function handleApproveConsultation(id: string) {
    "use server";
    await approveConsultationAction(id);
  }

  async function handleRejectConsultation(id: string, reason: string) {
    "use server";
    await rejectConsultationAction(id, reason);
  }

  // Fetch metrics & lists
  const [stats, rawAppointments, rawConsultations] = await Promise.all([
    AppointmentService.getAppointmentStats(),
    AppointmentService.getAllAppointments({}, 100, 0),
    getAllConsultations()
  ]);

  const appointments = JSON.parse(JSON.stringify(rawAppointments));
  const consultations = JSON.parse(JSON.stringify(rawConsultations));

  // Tab configurations
  const tabs = [
    { id: "appointments", label: "General Appointments", count: appointments.length },
    { id: "consultations", label: "Specialist Consultations", count: consultations.length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-blue-600" />
            Bookings & Consultations
          </h1>
          <p className="text-slate-500 mt-1">Review, approve, and manage telehealth sessions and clinical bookings.</p>
        </div>
      </div>

      {/* Stats Cards (Appointments specific stats) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Appts", value: stats.totalAppointments, color: "text-slate-900", bg: "bg-slate-50" },
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

      {/* Tabs selector */}
      <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentTab === tab.id
                ? "bg-slate-100 text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              currentTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Content list */}
      <div>
        {currentTab === "appointments" ? (
          appointments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No appointments scheduled</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
                There are currently no general appointments in the database.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt: any) => (
                <ExpandableApprovalCard
                  key={appt.id}
                  type="appointment"
                  item={appt}
                  onApprove={handleApproveAppointment}
                  onReject={handleRejectAppointment}
                />
              ))}
            </div>
          )
        ) : (
          consultations.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No specialist consultations</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
                There are currently no clinical consultations initialized in the database.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consult: any) => (
                <ExpandableApprovalCard
                  key={consult.id}
                  type="consultation"
                  item={consult}
                  onApprove={handleApproveConsultation}
                  onReject={handleRejectConsultation}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
