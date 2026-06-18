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

    revalidatePath("/doctor/appointments");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900">Scheduled Appointments</h2>
        </div>
        
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 border-dashed border-b-0 border-x-0">
            No appointments booked yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appt: any) => (
              <div key={appt.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-900">
                      {appt.patient_first_name} {appt.patient_last_name}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[appt.status]}`}>
                      {STATUS_ICONS[appt.status]}
                      {appt.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Date & Time: </span>
                    {new Date(appt.appointment_date).toLocaleDateString()} at {appt.start_time} - {appt.end_time}
                  </div>
                  
                  <p className="text-sm text-gray-500 max-w-lg">
                    <span className="font-medium text-gray-600">Reason: </span>
                    {appt.reason_for_visit || "No specific reason provided"}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 shrink-0">
                  {appt.status === "PENDING" && (
                    <form action={handleAction}>
                      <input type="hidden" name="id" value={appt.id} />
                      <input type="hidden" name="actionType" value="confirm" />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm">
                        Confirm
                      </button>
                    </form>
                  )}
                  
                  {(appt.status === "CONFIRMED" || appt.status === "RESCHEDULED") && (
                    <>
                      <form action={handleAction}>
                        <input type="hidden" name="id" value={appt.id} />
                        <input type="hidden" name="actionType" value="complete" />
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm">
                          Complete
                        </button>
                      </form>
                      
                      <form action={handleAction}>
                        <input type="hidden" name="id" value={appt.id} />
                        <input type="hidden" name="actionType" value="no_show" />
                        <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors border shadow-sm">
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
