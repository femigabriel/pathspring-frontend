"use client";

import type { LucideIcon } from "lucide-react";

type AppBadgeTone =
  | "default"
  | "emerald"
  | "cyan"
  | "purple"
  | "rose"
  | "amber"
  | "slate";

interface AppBadgeProps {
  label: string;
  icon?: LucideIcon;
  tone?: AppBadgeTone;
  className?: string;
}

const toneClasses: Record<AppBadgeTone, string> = {
  default:
    "border-gray-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  cyan:
    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-300",
  purple:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300",
  rose:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300",
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
  slate:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
};

export default function AppBadge({
  label,
  icon: Icon,
  tone = "default",
  className = "",
}: AppBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]} ${className}`.trim()}
    >
      {Icon ? <Icon size={12} /> : null}
      <span>{label}</span>
    </span>
  );
}
