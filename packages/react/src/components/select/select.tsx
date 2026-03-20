import React from "react";
import { useSelect, type UseSelectOptions } from "@entropix/core";
import { SelectContext } from "./select-context.js";
import { cn } from "../../utils/cn.js";
import "../../styles/select.css";

export interface SelectProps extends UseSelectOptions {
  /** Label for the select */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Select component — web adapter for @entropix/core's useSelect.
 *
 * Provides context to SelectTrigger, SelectContent, and SelectOption children.
 */
export function Select({ children, label, className, ...options }: SelectProps) {
  const select = useSelect(options);
  const labelProps = select.getLabelProps();

  return (
    <SelectContext.Provider value={select}>
      <div className={cn("entropix-select", className)}>
        {label && (
          <label
            className="entropix-select-label"
            id={labelProps.id}
            htmlFor={labelProps.htmlFor}
          >
            {label}
          </label>
        )}
        {children}
      </div>
    </SelectContext.Provider>
  );
}
