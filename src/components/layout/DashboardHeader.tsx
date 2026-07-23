import React from 'react';
import { NotificationBell } from '../ui/NotificationBell';

export function DashboardHeader({ role }: { role: "admin" | "specialist" | "patient" }) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <NotificationBell role={role} />
      </div>
    </header>
  );
}
