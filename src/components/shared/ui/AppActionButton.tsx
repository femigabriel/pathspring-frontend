"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppActionTone = "primary" | "secondary" | "success" | "danger" | "ghost";
type AppActionSize = "sm" | "md" | "lg";

interface AppActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  tone?: AppActionTone;
  size?: AppActionSize;
  fullWidth?: boolean;
}

const toneClasses: Record<AppActionTone, string> = {
  primary:
    "border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_10px_24px_rgba(6,182,212,0.18)] hover:brightness-105",
  secondary:
    "border-gray-200 bg-white text-slate-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
  success:
    "border-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.16)] hover:brightness-105",
  danger:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20",
  ghost:
    "border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyan-400/25 hover:bg-cyan-500/10 hover:text-cyan-100",
};

const sizeClasses: Record<AppActionSize, string> = {
  sm: "h-7 rounded-lg px-2.5 text-[11px]",
  md: "h-9 rounded-xl px-3.5 text-xs",
  lg: "h-11 rounded-2xl px-4.5 text-sm",
};

export default function AppActionButton({
  children,
  tone = "secondary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: AppActionButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 border font-semibold leading-none transition-all disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[tone]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
