"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Megaphone, Send } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  createNotification,
  getNotifications,
  markNotificationRead,
  type NotificationItem,
} from "@/src/lib/notification-api";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Just now";

export default function NotificationsPage() {
  const { user } = useAuth();
  const canCompose = user?.role === "SCHOOL_ADMIN" || user?.role === "TEACHER";
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    message: "",
    type: "announcement",
    recipientRoles: "TEACHER, SCHOOL_ADMIN, PARENT",
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      setNotifications(await getNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

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

  const handleCreate = async () => {
    setSending(true);
    setError("");
    setNotice("");

    try {
      await createNotification({
        title: draft.title.trim(),
        message: draft.message.trim(),
        type: draft.type.trim() || "announcement",
        recipientRoles: draft.recipientRoles
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setDraft({
        title: "",
        message: "",
        type: "announcement",
        recipientRoles: "TEACHER, SCHOOL_ADMIN, PARENT",
      });
      setNotice("Notification sent successfully.");
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Notifications</p>
            <h1 className="mt-3 text-4xl font-black text-white">Shared inbox for school updates</h1>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Read announcements, mark them as seen, and {canCompose ? "send new updates to teachers, admins, and parents." : "keep up with school messages from teachers and admins."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-black text-white">{notifications.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Unread</p>
              <p className="mt-1 text-2xl font-black text-white">{unreadCount}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {canCompose ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-200">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Create Notification</h2>
                <p className="mt-1 text-sm text-slate-400">Send a school update to selected roles.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Title" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-400" />
              <textarea rows={4} value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} placeholder="Message" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-400" />
              <div className="grid gap-4 md:grid-cols-2">
                <input value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} placeholder="Type" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-400" />
                <input value={draft.recipientRoles} onChange={(event) => setDraft({ ...draft, recipientRoles: event.target.value })} placeholder="Recipient roles separated by commas" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-purple-400" />
              </div>
              <button onClick={() => void handleCreate()} disabled={sending || !draft.title.trim() || !draft.message.trim()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-bold text-white disabled:opacity-60">
                <Send size={18} />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-200">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Inbox</h2>
              <p className="mt-1 text-sm text-slate-400">Tap a message to mark it as read.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => void handleMarkRead(notification.id)}
                  className={`block w-full rounded-[1.5rem] border p-4 text-left transition-all ${
                    notification.isRead
                      ? "border-white/10 bg-white/5"
                      : "border-purple-400/20 bg-purple-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-white">{notification.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{notification.message}</p>
                    </div>
                    {!notification.isRead ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-400" /> : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>{notification.type ?? "notification"}</span>
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
