import { AppointmentService } from "@/services/appointment.service";
import { getExpertByUserId } from "@/lib/db/queries";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export default async function DoctorAppointmentsPage() {
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

  const appointments = await AppointmentService.getSpecialistAppointments(doctor.id, undefined, 100, 0);

  async function handleAction(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const actionType = formData.get("actionType") as string;

    if (actionType === "confirm") {
      await AppointmentService.confirmAppointment(id);
    } else if (actionType === "complete") {
      await AppointmentService.completeAppointment(id);
    } else if (actionType === "no_show") {
      await AppointmentService.markNoShow(id);
    }

    revalidatePath("/specialist/appointments");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-emerald-600" />
            My Appointments
          </h1>
          <p className="text-slate-500 mt-1">Manage your upcoming and past patient appointments.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <h2 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Scheduled Appointments</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-slate-50/30">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No appointments scheduled</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              You currently have no patient appointments booked.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((appt: any) => (
              <div key={appt.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                    <UserX size={20} className={appt.status === 'NO_SHOW' ? 'text-red-400' : 'text-slate-400'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <p className="font-bold text-slate-900 text-lg">
                        {appt.patient_first_name} {appt.patient_last_name}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${STATUS_STYLES[appt.status]}`}>
                        {STATUS_ICONS[appt.status]}
                        {appt.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-600 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-semibold">{new Date(appt.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span className="font-semibold">{appt.start_time} - {appt.end_time}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block mt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reason for visit</p>
                      <p className="text-sm text-slate-700 font-medium">
                        {appt.reason_for_visit || "No specific reason provided"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 shrink-0 sm:self-start mt-2 sm:mt-0">
                  {appt.status === "PENDING" && (
                    <form action={handleAction}>
                      <input type="hidden" name="id" value={appt.id} />
                      <input type="hidden" name="actionType" value="confirm" />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
                        Confirm Appointment
                      </button>
                    </form>
                  )}
                  
                  {(appt.status === "CONFIRMED" || appt.status === "RESCHEDULED") && (
                    <>
                      <form action={handleAction}>
                        <input type="hidden" name="id" value={appt.id} />
                        <input type="hidden" name="actionType" value="complete" />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
                          Mark Completed
                        </button>
                      </form>
                      
                      <form action={handleAction}>
                        <input type="hidden" name="id" value={appt.id} />
                        <input type="hidden" name="actionType" value="no_show" />
                        <button type="submit" className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-all border border-slate-200 shadow-sm">
                          No Show
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
