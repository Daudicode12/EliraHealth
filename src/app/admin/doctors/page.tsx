import { getExpertsByStatus, approveExpert, rejectExpert, suspendExpert, getExpertStatusCounts } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { ExpandableDoctorCard } from "@/components/admin/ExpandableDoctorCard";
import { cookies } from "next/headers";
import Link from "next/link";
import { Users, FileSearch } from "lucide-react";

export default async function AdminDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "pending";
  
  const counts = await getExpertStatusCounts();
  const rawDoctors = await getExpertsByStatus(currentTab as any);
  
  // Convert database row objects to plain JavaScript objects for the Client Component
  const doctors = JSON.parse(JSON.stringify(rawDoctors));

  async function handleApprove(id: string) {
    "use server";
    const token = (await cookies()).get("auth-token")?.value;
    let adminId = token?.replace("mock-token-", "") || 'system';
    if (token?.startsWith("mock-jwt-")) {
      try {
        const decoded = JSON.parse(Buffer.from(token.replace("mock-jwt-", ""), "base64").toString("utf-8"));
        adminId = decoded.id;
      } catch(e) {}
    }
    await approveExpert(id, adminId);
    revalidatePath("/admin/doctors");
  }

  async function handleReject(id: string, reason: string) {
    "use server";
    await rejectExpert(id, reason);
    revalidatePath("/admin/doctors");
  }

  async function handleSuspend(id: string) {
    "use server";
    await suspendExpert(id);
    revalidatePath("/admin/doctors");
  }

  const tabs = [
    { id: "pending", label: `Pending Review`, count: counts.pending || 0 },
    { id: "approved", label: `Approved`, count: counts.approved || 0 },
    { id: "rejected", label: `Rejected`, count: counts.rejected || 0 },
    { id: "suspended", label: `Suspended`, count: counts.suspended || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-purple-600" />
            Verification & Doctors
          </h1>
          <p className="text-slate-500 mt-1">Review specialist applications and manage active accounts.</p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div>
        {doctors.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileSearch className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No {currentTab} applications</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              There are currently no doctor accounts in the "{currentTab}" status.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor: any) => (
              <ExpandableDoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onApprove={handleApprove}
                onReject={handleReject}
                onSuspend={handleSuspend}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
