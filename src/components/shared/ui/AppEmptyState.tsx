"use client";

import type { LucideIcon } from "lucide-react";

interface AppEmptyStateProps {
  title: string;
  body: string;
  icon: LucideIcon;
  className?: string;
}

export default function AppEmptyState({
  title,
  body,
  icon: Icon,
  className = "",
}: AppEmptyStateProps) {
  return (
    <div
      className={`flex min-h-[18rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-gray-200 bg-gray-50 px-6 text-center dark:border-white/10 dark:bg-white/5 ${className}`.trim()}
    >
      <Icon size={38} className="text-emerald-500 dark:text-emerald-300" />
      <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
    </div>
  );
}
