"use client";

import React, { useEffect, useState } from "react";
import { Notification } from "@/lib/services/notification.service";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";

export function NotificationsPage({ role }: { role: "admin" | "specialist" | "patient" }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=100");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with your latest alerts and messages.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
            <Bell size={16} />
            {unreadCount} Unread
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-purple-200 hover:shadow"
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-purple-400 w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No notifications yet</h3>
            <p className="text-slate-500">When you receive notifications, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 transition-colors flex gap-4 group ${
                  notification.is_read ? 'bg-white' : 'bg-purple-50/40'
                }`}
              >
                <div className="mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.is_read ? 'bg-slate-100 text-slate-500' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <Bell size={20} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className={`text-base ${notification.is_read ? 'font-medium text-slate-800' : 'font-semibold text-slate-900'}`}>
                        {notification.title}
                      </h4>
                      <p className={`mt-1 text-sm ${notification.is_read ? 'text-slate-600' : 'text-slate-700'}`}>
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                      {new Date(notification.created_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Check size={14} />
                        Mark as read
                      </button>
                    )}
                    
                    {notification.action_url && (
                      <a 
                        href={notification.action_url}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink size={14} />
                        View details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
