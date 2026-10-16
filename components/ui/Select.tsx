import React, { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, value, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full appearance-none rounded-xl border px-4 py-2.5 pr-10",
            "text-sm min-h-[44px] transition-all focus:outline-none focus:ring-2",
            "bg-white border-[#ebdccb] text-[#111827] focus:ring-[#034d28]/20 focus:border-[#034d28]",
            "dark:border-emerald-800/50 dark:bg-[#031309] dark:text-emerald-100 dark:focus:ring-emerald-400/40 dark:focus:border-emerald-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-emerald-400/60" />
      </div>
    );
  }
);

Select.displayName = "Select";

export function SelectItem({
  value,
  children,
  ...props
}: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
}
