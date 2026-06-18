import { logoutAction } from "@/lib/actions/auth.actions";
import { DoctorSidebar } from "@/components/layout/DoctorSidebar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      <DoctorSidebar logoutAction={logoutAction} />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
