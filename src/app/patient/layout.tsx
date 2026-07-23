import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader role="patient" />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
