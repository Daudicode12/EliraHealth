"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, LogOut, Menu, X, ShieldPlus } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Verification & Doctors", icon: Users },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
];

export function AdminSidebar({ logoutAction }: { logoutAction: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShieldPlus className="text-purple-400" />
          Elira Admin
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
        w-64 bg-slate-900 bg-gradient-to-b from-purple-950 to-slate-900
        text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="hidden lg:flex items-center gap-3 px-6 py-8 font-bold text-xl text-white border-b border-white/10 shadow-sm">
          <ShieldPlus className="text-purple-400" size={28} />
          Elira Admin
        </div>

        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto mt-4 lg:mt-0">
          <p className="px-3 text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">Management</p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/50" 
                    : "hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-purple-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={18} className="text-red-400" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
