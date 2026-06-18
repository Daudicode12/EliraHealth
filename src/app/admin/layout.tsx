import { logoutAction } from "@/lib/actions/auth.actions";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar logoutAction={logoutAction} />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
