"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/src/contexts/AuthContext";
import { getSchoolWorkspaceBaseRoute } from "@/src/lib/auth";
import {
  getNotifications,
  markNotificationRead,
  type NotificationItem,
} from "@/src/lib/notification-api";

const prettyTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Just now";

export default function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const notificationsRoute =
    user?.role === "PARENT"
      ? "/parent/notifications"
      : `${getSchoolWorkspaceBaseRoute(user?.role)}/notifications`;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const loadNotifications = async () => {
    setLoading(true);
    try {
      setNotifications(await getNotifications());
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadNotifications();
  }, [user?.id, user?.role]);

  const handleOpen = async () => {
    setOpen((current) => !current);
    if (!open) {
      await loadNotifications();
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    try {
      await markNotificationRead(notificationId);
    } catch {
      await loadNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => void handleOpen()}
        className="relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <Bell size={20} className="text-gray-500 dark:text-slate-400" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {unreadCount} unread
                </p>
              </div>
              <Link
                href={notificationsRoute}
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Open inbox
              </Link>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 6).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => void handleMarkRead(notification.id)}
                    className={`block w-full border-b border-gray-100 p-4 text-left transition-colors last:border-b-0 dark:border-slate-700/50 ${
                      notification.isRead
                        ? "bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                        : "bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-300">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead ? (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      {prettyTime(notification.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
