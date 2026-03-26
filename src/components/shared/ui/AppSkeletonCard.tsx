"use client";

interface AppSkeletonCardProps {
  className?: string;
}

export default function AppSkeletonCard({ className = "" }: AppSkeletonCardProps) {
  return (
    <div
      className={`animate-pulse rounded-[1.75rem] border border-gray-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 ${className}`.trim()}
    >
      <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="mt-4 h-7 w-3/4 rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-3 h-4 w-full rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-2 h-4 w-5/6 rounded-xl bg-slate-200 dark:bg-white/10" />
      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-7 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-slate-200 dark:bg-white/10" />
        <div className="h-16 rounded-2xl bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}
