"use client";

import type { LucideIcon } from "lucide-react";

type AppStatTone = "default" | "emerald" | "cyan" | "purple" | "rose" | "amber";

interface AppStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: AppStatTone;
  helper?: string;
  className?: string;
}

const toneClasses: Record<AppStatTone, string> = {
  default:
    "border-white/60 bg-white/80 dark:border-white/10 dark:bg-white/5",
  emerald:
    "border-emerald-200 bg-emerald-50/90 dark:border-emerald-400/20 dark:bg-emerald-500/10",
  cyan:
    "border-cyan-200 bg-cyan-50/90 dark:border-cyan-400/20 dark:bg-cyan-500/10",
  purple:
    "border-purple-200 bg-purple-50/90 dark:border-purple-400/20 dark:bg-purple-500/10",
  rose:
    "border-rose-200 bg-rose-50/90 dark:border-rose-400/20 dark:bg-rose-500/10",
  amber:
    "border-amber-200 bg-amber-50/90 dark:border-amber-400/20 dark:bg-amber-500/10",
};

export default function AppStatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  helper,
  className = "",
}: AppStatCardProps) {
  return (
    <div
      className={`flex min-h-[5.75rem] flex-col justify-center rounded-2xl border px-4 py-3 text-center shadow-sm ${toneClasses[tone]} ${className}`.trim()}
    >
      <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {Icon ? <Icon size={13} /> : null}
        <span>{label}</span>
      </div>
      <p className="mt-1 whitespace-nowrap text-2xl font-black leading-none text-slate-900 dark:text-white">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      ) : null}
    </div>
  );
}
