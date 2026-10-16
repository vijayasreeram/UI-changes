import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 bg-white border-[#ebdccb] text-[#111827] placeholder:text-gray-400 focus:ring-[#034d28]/20 focus:border-[#034d28] dark:border-emerald-800/50 dark:bg-[#031309] dark:text-emerald-100 dark:placeholder-emerald-100/30 dark:focus:ring-emerald-500/30 dark:focus:border-emerald-400",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
