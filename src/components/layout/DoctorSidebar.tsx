"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, LogOut, Menu, X, FileText, Clock, UserCog, Stethoscope, Bell } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/specialist/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/specialist/patients", label: "My Patients", icon: Users, isLockable: true },
  { href: "/specialist/appointments", label: "Appointments", icon: Calendar, isLockable: true },
  { href: "/specialist/consultations", label: "Consultations", icon: Stethoscope, isLockable: true },
  { href: "/specialist/medical-records", label: "Medical Records", icon: FileText, isLockable: true },
  { href: "/specialist/availability", label: "Availability", icon: Clock, isLockable: true },
  { href: "/specialist/notifications", label: "Notifications", icon: Bell },
  { href: "/specialist/profile", label: "My Profile", icon: UserCog },
];

export function DoctorSidebar({ logoutAction, profileStatus = "approved" }: { logoutAction: () => void; profileStatus?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Stethoscope className="text-emerald-400" />
          Elira Specialist
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-white/10 rounded-md">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-950
        text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="hidden lg:flex items-center gap-3 px-6 py-8 font-bold text-xl text-white border-b border-white/10">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-900 p-1.5 rounded-lg shadow-lg">
            <Stethoscope size={24} />
          </div>
          Elira Health
        </div>

        <nav className="flex-1 flex flex-col gap-1.5 p-4 overflow-y-auto mt-4 lg:mt-0">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Clinical Workspace</p>
          {NAV.map(({ href, label, icon: Icon, isLockable }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            const isLocked = isLockable && profileStatus !== 'approved';
            
            return (
              <Link
                key={href}
                href={isLocked ? "/specialist/dashboard" : href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm" 
                    : "hover:bg-white/5 hover:text-white"
                  }
                  ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                  <span>{label}</span>
                </div>
                {isLocked && (
                  <span className="text-xs text-slate-500 font-semibold" title="Requires verification">
                    🔒
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} className="text-red-400/80" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
