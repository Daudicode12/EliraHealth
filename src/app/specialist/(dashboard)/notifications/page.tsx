import { getNotificationsForUser, markNotificationRead } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";

const TYPE_ICON: Record<string, any> = {
  info: <Info size={16} className="text-blue-600" />,
  success: <CheckCircle2 size={16} className="text-brand" />,
  warning: <AlertTriangle size={16} className="text-amber-600" />,
  error: <XCircle size={16} className="text-red-600" />,
};

const TYPE_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-brand/5 border-brand/20",
  warning: "bg-amber-50 border-amber-200",
  error: "bg-red-50 border-red-200",
};

export default async function NotificationsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const notifications = await getNotificationsForUser(session.id);

  async function handleMarkRead(id: string) {
    "use server";
    await markNotificationRead(id);
    revalidatePath("/specialist/notifications");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Bell className="text-purple-600" />
          Notifications
        </h1>
        <p className="text-slate-500 mt-1">Updates about your account and application status.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No notifications yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
            You'll see account and application updates here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${TYPE_STYLES[n.type] || TYPE_STYLES.info} ${
                n.is_read ? "opacity-60" : ""
              }`}
            >
              <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] || TYPE_ICON.info}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 whitespace-pre-line">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
              {!n.is_read && (
                <form action={handleMarkRead.bind(null, n.id)}>
                  <button
                    type="submit"
                    className="text-xs font-semibold text-brand hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Mark read
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
