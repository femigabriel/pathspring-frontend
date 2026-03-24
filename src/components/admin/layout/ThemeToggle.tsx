// src/components/dashboard/ThemeToggle.tsx
"use client";

import { useTheme } from "@/src/contexts/ThemeContext";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 transition-colors relative"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-slate-400" />
        ) : (
          <Moon size={20} className="text-slate-600" />
        )}
      </motion.div>
    </motion.button>
  );
}