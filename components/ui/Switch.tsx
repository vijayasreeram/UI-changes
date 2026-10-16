"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Switch({ checked, onCheckedChange, disabled = false, className, id }: SwitchProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isLight
          ? checked
            ? "bg-[#065b34] border-[#065b34] focus:ring-offset-white"
            : "bg-[#ebdccb] border-[#d8c2ad] focus:ring-offset-white"
          : checked
          ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] border-emerald-400 focus:ring-offset-[#020905]"
          : "bg-[#062012] border-emerald-900/60 focus:ring-offset-[#020905]",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
