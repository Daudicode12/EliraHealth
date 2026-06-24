import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/db/queries";
import { ConsultationService } from "@/services/consultation.service";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default async function PatientConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "upcoming";

  const token = (await cookies()).get("auth-token")?.value;
  let userId = token?.replace("mock-token-", "");
  if (token?.startsWith("mock-jwt-")) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
      userId = decoded.id;
    } catch(e) {}
  }
  if (!userId) redirect("/login");

  const profile = await getProfileById(userId);
  if (!profile) redirect("/login");

  const upcomingConsultations = await ConsultationService.getPatientUpcomingConsultations(userId);
  const completedConsultations = await ConsultationService.getPatientConsultationHistory(userId);
  
  // Filter completed to only show actually completed ones
  const completed = completedConsultations.filter(c => c.status === 'completed');
  
  const tabs = [
    { key: "upcoming", label: "Upcoming", icon: "📅", count: upcomingConsultations.length },
    { key: "completed", label: "Completed", icon: "✅", count: completed.length },
  ];

  const displayConsultations = activeTab === "completed" ? completed : upcomingConsultations;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Consultations</h1>
        <p className="text-sm text-gray-500 mt-1">View your consultation history and upcoming appointments</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/patient/consultations?tab=${tab.key}`}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Consultation List */}
      {displayConsultations.length === 0 ? (
        <div className="p-16 text-center border rounded-xl bg-gray-50 border-dashed">
          <span className="text-4xl block mb-4">
            {activeTab === "upcoming" ? "📅" : "✅"}
          </span>
          <p className="text-gray-500 font-medium">
            {activeTab === "upcoming"
              ? "No upcoming consultations"
              : "No completed consultations yet"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "upcoming"
              ? "Your confirmed appointments will appear here"
              : "Completed consultations with recommendations will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayConsultations.map((c: any, index: number) => (
            <div
              key={c.id}
              className="rounded-xl border bg-white overflow-hidden hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                        🩺
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          Dr. {c.specialist_name}
                        </p>
                        <p className="text-xs text-gray-500">Specialist</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 ml-[52px]">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-600">Date:</span>{" "}
                        {formatDate(c.appointment_date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-600">Time:</span>{" "}
                        {formatTime(c.start_time)} – {formatTime(c.end_time)}
                      </p>
                    </div>

                    {c.reason_for_visit && (
                      <p className="text-xs text-gray-400 mt-2 ml-[52px] italic">
                        "{c.reason_for_visit}"
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      STATUS_STYLES[c.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </div>
              </div>

              {/* Show notes for completed consultations */}
              {activeTab === "completed" && c.notes && (
                <div className="border-t bg-gray-50 p-5">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Consultation Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {c.notes.chief_complaint && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Chief Complaint</p>
                        <p className="text-sm text-gray-800">{c.notes.chief_complaint}</p>
                      </div>
                    )}
                    {c.notes.symptoms && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Symptoms</p>
                        <p className="text-sm text-gray-800">{c.notes.symptoms}</p>
                      </div>
                    )}
                    {c.notes.assessment && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Assessment</p>
                        <p className="text-sm text-gray-800">{c.notes.assessment}</p>
                      </div>
                    )}
                    {c.notes.recommendations && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Recommendations</p>
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-sm text-gray-800">{c.notes.recommendations}</p>
                        </div>
                      </div>
                    )}
                    {c.notes.follow_up_required === 1 && c.notes.follow_up_date && (
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <span>📅</span>
                          <div>
                            <p className="text-xs font-medium text-blue-700">Follow-up Scheduled</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {formatDate(c.notes.follow_up_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
