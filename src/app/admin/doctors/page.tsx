import { getExpertsByStatus, approveExpert, rejectExpert, suspendExpert, getExpertStatusCounts } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { ExpandableDoctorCard } from "@/components/admin/ExpandableDoctorCard";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "pending";
  
  const counts = await getExpertStatusCounts();
  const doctors = await getExpertsByStatus(currentTab as any);

  async function handleApprove(id: string) {
    "use server";
    const token = (await cookies()).get("auth-token")?.value;
    const adminId = token?.replace("mock-token-", "") || 'system';
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
    { id: "pending", label: `Pending (${counts.pending || 0})` },
    { id: "approved", label: `Approved (${counts.approved || 0})` },
    { id: "rejected", label: `Rejected (${counts.rejected || 0})` },
    { id: "suspended", label: `Suspended (${counts.suspended || 0})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Doctors Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              currentTab === tab.id
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {currentTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
            )}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {doctors.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-gray-50 border-dashed">
            <p className="text-gray-500">No doctors found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
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
