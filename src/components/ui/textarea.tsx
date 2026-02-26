"use client"

import { forwardRef, type TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-navy-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            "block w-full rounded-lg border bg-surface-0 px-3.5 py-2.5",
            "text-sm text-navy-800 placeholder:text-surface-400",
            "transition-all duration-150 resize-y min-h-[100px]",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
            "hover:border-surface-300",
            error
              ? "border-error/50 focus:ring-error/20 focus:border-error"
              : "border-surface-200",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-surface-400">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
