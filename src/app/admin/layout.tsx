import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth.actions";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/appointments", label: "Appointments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-card flex flex-col">
        <div className="px-5 py-6 font-semibold text-base border-b">Elira Admin</div>
        <nav className="flex-1 flex flex-col gap-1 p-3">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="p-3">
          <button type="submit" className="w-full rounded-md px-3 py-2 text-sm text-left hover:bg-muted transition-colors">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
