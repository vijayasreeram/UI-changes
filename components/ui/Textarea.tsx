import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white border-[#ebdccb] text-[#111827] placeholder:text-gray-400 focus:ring-[#034d28]/20 focus:border-[#034d28] dark:border-emerald-800/50 dark:bg-[#031309] dark:text-emerald-100 dark:placeholder-emerald-100/30 dark:focus:ring-emerald-400/40 dark:focus:border-emerald-400",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
