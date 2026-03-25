"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Loader2,
  Megaphone,
  Send,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  createNotification,
  getNotifications,
  markNotificationRead,
  type CreateNotificationInput,
  type NotificationItem,
} from "@/src/lib/notification-api";

const notificationTypes = [
  { value: "announcement", label: "Announcement" },
  { value: "reminder", label: "Reminder" },
  { value: "progress", label: "Progress" },
] as const;

const recipientRoleOptions = [
  { value: "TEACHER", label: "Teachers" },
  { value: "SCHOOL_ADMIN", label: "School Admins" },
  { value: "PARENT", label: "Parents" },
] as const;

const prettyTime = (value?: string) =>
  value ? new Date(value).toLocaleString() : "Just now";

const NotificationCard = ({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead: (notificationId: string) => void;
}) => (
  <article
    className={`rounded-[1.6rem] border p-5 transition-all ${
      item.isRead
        ? "border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
        : "border-purple-200 bg-purple-50/80 dark:border-purple-400/20 dark:bg-purple-500/10"
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</p>
          {item.isRead ? null : (
            <span className="rounded-full bg-purple-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              New
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.message}</p>
      </div>
      {!item.isRead ? (
        <button
          onClick={() => onMarkRead(item.id)}
          className="shrink-0 rounded-2xl border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-400/20 dark:bg-slate-950/60 dark:text-purple-300 dark:hover:bg-purple-500/10"
        >
          Mark read
        </button>
      ) : null}
    </div>
    <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
      <span>{item.type ?? "notification"}</span>
      <span>{prettyTime(item.createdAt)}</span>
    </div>
  </article>
);

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<CreateNotificationInput>({
    title: "",
    message: "",
    type: "announcement",
    recipientRoles: ["TEACHER", "SCHOOL_ADMIN", "PARENT"],
  });

  const canCompose = user?.role === "SCHOOL_ADMIN" || user?.role === "TEACHER";

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      setNotifications(await getNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );

    try {
      await markNotificationRead(notificationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notification.");
      await loadNotifications();
    }
  };

  const handleRecipientToggle = (role: string) => {
    setDraft((current) => {
      const alreadyIncluded = current.recipientRoles.includes(role);
      const recipientRoles = alreadyIncluded
        ? current.recipientRoles.filter((item) => item !== role)
        : [...current.recipientRoles, role];

      return {
        ...current,
        recipientRoles,
      };
    });
  };

  const handleSend = async () => {
    if (!draft.title.trim() || !draft.message.trim() || draft.recipientRoles.length === 0) {
      setError("Please add a title, message, and at least one audience.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createNotification({
        title: draft.title.trim(),
        message: draft.message.trim(),
        type: draft.type,
        recipientRoles: draft.recipientRoles,
      });
      setNotice("Notification sent successfully.");
      setDraft({
        title: "",
        message: "",
        type: "announcement",
        recipientRoles: ["TEACHER", "SCHOOL_ADMIN", "PARENT"],
      });
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_22%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-xl dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_22%),linear-gradient(180deg,#0f172a_0%,#020617_100%)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm dark:bg-white/10 dark:text-purple-300">
              <Bell size={16} />
              Notifications Inbox
            </div>
            <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
              School updates in one place
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              Read announcements, progress reminders, and class updates without hunting across pages.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-purple-100 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Unread</p>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{unreadCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-cyan-100 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Messages</p>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{notifications.length}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {notice}
        </div>
      ) : null}

      <div className={`grid gap-6 ${canCompose ? "xl:grid-cols-[0.95fr_1.05fr]" : ""}`}>
        {canCompose ? (
          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 p-3 text-white">
                <Megaphone size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Send a notification</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Share reading reminders and school updates with the right audience.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Notification title"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-purple-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
              <textarea
                rows={5}
                value={draft.message}
                onChange={(event) => setDraft({ ...draft, message: event.target.value })}
                placeholder="Write the update you want parents, teachers, or admins to see."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-purple-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
              <select
                value={draft.type}
                onChange={(event) => setDraft({ ...draft, type: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-purple-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              >
                {notificationTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Send to</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {recipientRoleOptions.map((option) => {
                    const active = draft.recipientRoles.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleRecipientToggle(option.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                          active
                            ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300"
                            : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-purple-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-purple-400/20 dark:hover:text-purple-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => void handleSend()}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {saving ? "Sending..." : "Send notification"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recent messages</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tap a new item to mark it as read.
              </p>
            </div>
            {!loading && unreadCount > 0 ? (
              <button
                onClick={() => {
                  notifications
                    .filter((item) => !item.isRead)
                    .forEach((item) => void handleMarkRead(item.id));
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-purple-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5">
                <Sparkles size={34} className="mx-auto text-purple-400" />
                <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No notifications yet</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  When new reading updates arrive, they will show up here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
