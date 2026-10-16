"use client";
import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "mint" | "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    let themeIsLight = false;
    try {
      const { theme } = useTheme();
      themeIsLight = theme === "light";
    } catch {}

    const variants = {
      default: themeIsLight
        ? "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732] shadow-sm font-bold"
        : "bg-emerald-500 text-[#020905] hover:bg-emerald-400 active:bg-emerald-600 shadow-md shadow-emerald-500/20 font-bold",
      mint: themeIsLight
        ? "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732] font-bold shadow-md shadow-[#065b34]/20"
        : "bg-[#22c55e] hover:bg-[#16a34a] text-[#022c15] font-bold shadow-lg shadow-emerald-900/40",
      primary: "bg-gradient-to-r from-[#065b34] to-[#044728] text-white hover:from-[#087342] hover:to-[#055732] shadow-md shadow-[#065b34]/20 font-bold",
      secondary: themeIsLight
        ? "bg-[#f7f3ea] text-[#4b5563] hover:text-[#111827] border border-[#ebdccb] hover:bg-[#ebdccb]/60 active:bg-[#ebdccb]"
        : "bg-[#062012] text-emerald-100 hover:bg-[#0a2e1c] border border-emerald-800/60 active:bg-[#031309]",
      outline: themeIsLight
        ? "border border-[#ebdccb] bg-white text-[#4b5563] hover:text-[#111827] hover:bg-[#f7f3ea] active:bg-[#ebdccb]/60"
        : "border border-emerald-700/60 bg-black/40 text-emerald-100 hover:bg-emerald-950/80 hover:border-emerald-500/80 active:bg-black/80",
      ghost: themeIsLight
        ? "bg-transparent text-[#4b5563] hover:bg-[#f7f3ea] hover:text-[#111827]"
        : "bg-transparent text-emerald-300 hover:bg-emerald-950/60 hover:text-white active:bg-emerald-900/40",
      destructive: "bg-rose-600/90 text-white hover:bg-rose-500 active:bg-rose-700 border border-rose-500/30",
      link: themeIsLight
        ? "text-[#034d28] underline-offset-4 hover:underline bg-transparent"
        : "text-emerald-400 underline-offset-4 hover:underline bg-transparent",
    };

    const sizes = {
      default: "h-11 px-4 py-2 text-sm min-h-[44px]",
      sm: "h-9 px-3 text-xs min-h-[36px]",
      lg: "h-12 px-6 text-base min-h-[48px]",
      icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          themeIsLight ? "focus:ring-offset-white" : "focus:ring-offset-[#020905]",
          variants[variant] || variants.default,
          sizes[size] || sizes.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
