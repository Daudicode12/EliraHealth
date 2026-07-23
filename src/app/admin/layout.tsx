import { logoutAction } from "@/lib/actions/auth.actions";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar logoutAction={logoutAction} />
      <div className="flex-1 flex flex-col w-full">
        <DashboardHeader role="admin" />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}
