import { getServerSession } from "@/lib/auth/server-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getExpertByUserId, getExpertConsultations, updateConsultationStatus } from "@/lib/db/queries";
import { ConsultationService } from "@/services/consultation.service";
import { getServerSession } from "@/lib/auth/session";
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

const TAB_CONFIG = [
  { key: "upcoming", label: "Upcoming", icon: "📅" },
  { key: "in_progress", label: "In Progress", icon: "⏳" },
  { key: "completed", label: "Completed", icon: "✅" },
];

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

function calculateDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return '—';
  try {
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  } catch {
    return '—';
  }
}

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "upcoming";
  const searchQuery = resolvedParams.search || "";

  const session = await getServerSession();
  let userId = session?.id;
  if (!userId) {
    const token = (await cookies()).get("auth-token")?.value;
    if (token?.startsWith("mock-jwt-")) {
      try {
        const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
        userId = decoded.id;
      } catch (e) {}
    } else {
      userId = token?.replace("mock-token-", "");
    }
  }
  if (!userId) redirect("/login");

  const doctor = await getExpertByUserId(userId);
  if (!doctor) redirect("/login");

  // Fetch metrics
  const metrics = await ConsultationService.getSpecialistConsultationMetrics(doctor.id);

  // Fetch consultations based on active tab
  let consultations;
  switch (activeTab) {
    case "in_progress":
      consultations = await ConsultationService.getInProgressConsultations(doctor.id);
      break;
    case "completed":
      consultations = await ConsultationService.getCompletedConsultations(doctor.id);
      break;
    default:
      consultations = await ConsultationService.getUpcomingConsultations(doctor.id);
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    consultations = consultations.filter((c) => {
      const name = `${c.patient_first_name} ${c.patient_last_name}`.toLowerCase();
      return name.includes(query);
    });
  }

  // Server action for starting consultation
  async function handleStartConsultation(formData: FormData) {
    "use server";
    const appointmentId = formData.get("appointmentId") as string;
    const specialistId = formData.get("specialistId") as string;
    
    try {
      const consultationId = await ConsultationService.startConsultation(appointmentId, specialistId);
      redirect(`/specialist/consultations/${consultationId}`);
    } catch (error) {
      console.error("Failed to start consultation:", error);
      revalidatePath("/specialist/consultations");
    }
  }

  const metricCards = [
    { label: "Upcoming", value: metrics.upcoming, color: "blue", icon: "📅", tab: "upcoming" },
    { label: "In Progress", value: metrics.inProgress, color: "amber", icon: "⏳", tab: "in_progress" },
    { label: "Completed", value: metrics.completed, color: "green", icon: "✅", tab: "completed" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Consultations</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your patient consultations</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((card) => (
          <Link key={card.label} href={`/specialist/consultations?tab=${card.tab}`}>
            <div className={`rounded-2xl border p-5 bg-white hover:shadow-md transition-all cursor-pointer ${
              activeTab === card.tab ? `ring-2 ring-${card.color}-500 shadow-sm` : ''
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className={`text-3xl font-bold mt-1 text-${card.color}-600`}>{card.value}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px">
          {TAB_CONFIG.map((tab) => (
            <Link
              key={tab.key}
              href={`/specialist/consultations?tab=${tab.key}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search */}
      <form className="flex gap-3" action="/specialist/consultations" method="GET">
        <input type="hidden" name="tab" value={activeTab} />
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by patient name..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Search
        </button>
        {searchQuery && (
          <Link
            href={`/specialist/consultations?tab=${activeTab}`}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Consultation List */}
      {consultations.length === 0 ? (
        <div className="p-16 text-center border rounded-xl bg-gray-50 border-dashed">
          <span className="text-4xl block mb-4">
            {activeTab === "upcoming" ? "📅" : activeTab === "in_progress" ? "⏳" : "✅"}
          </span>
          <p className="text-gray-500 font-medium">
            {activeTab === "upcoming" && "No upcoming consultations"}
            {activeTab === "in_progress" && "No consultations in progress"}
            {activeTab === "completed" && "No completed consultations yet"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "upcoming" && "Confirmed appointments will appear here"}
            {activeTab === "in_progress" && "Start a consultation from the Upcoming tab"}
            {activeTab === "completed" && "Completed consultations will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c, index) => (
            <div
              key={c.id}
              className="rounded-xl border bg-white p-5 hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {(c.patient_first_name?.[0] || '').toUpperCase()}{(c.patient_last_name?.[0] || '').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {c.patient_first_name} {c.patient_last_name}
                      </p>
                      {c.patient_email && (
                        <p className="text-xs text-gray-400">{c.patient_email}</p>
                      )}
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
                    {activeTab === "completed" && (
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-600">Duration:</span>{" "}
                        {calculateDuration(c.started_at, c.ended_at)}
                      </p>
                    )}
                  </div>

                  {c.reason_for_visit && (
                    <p className="text-xs text-gray-400 mt-2 ml-[52px] italic">
                      "{c.reason_for_visit}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      STATUS_STYLES[c.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABELS[c.status] || c.status}
                  </span>

                  {/* Action buttons */}
                  {activeTab === "upcoming" && (
                    <form action={handleStartConsultation}>
                      <input type="hidden" name="appointmentId" value={c.appointment_id} />
                      <input type="hidden" name="specialistId" value={doctor.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        <span>🩺</span>
                        Start Consultation
                      </button>
                    </form>
                  )}

                  {activeTab === "in_progress" && (
                    <Link
                      href={`/specialist/consultations/${c.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      <span>📝</span>
                      Continue
                    </Link>
                  )}

                  {activeTab === "completed" && (
                    <Link
                      href={`/specialist/consultations/${c.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                    >
                      <span>👁️</span>
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
