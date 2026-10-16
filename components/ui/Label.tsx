import React, { forwardRef, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-bold uppercase tracking-wider text-[#374151] dark:text-emerald-300/90 block",
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
