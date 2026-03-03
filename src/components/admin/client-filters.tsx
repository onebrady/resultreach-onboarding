"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const statuses = [
  { value: "all", label: "All" },
  { value: "invited", label: "Invited" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
] as const

interface ClientFiltersProps {
  counts: Record<string, number>
  currentStatus: string
  currentSearch: string
}

export function ClientFilters({ counts, currentStatus, currentSearch }: ClientFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all" && value !== "") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface-100/60 rounded-lg w-fit">
        {statuses.map((s) => {
          const active = currentStatus === s.value
          const count = s.value === "all" ? counts.all : (counts[s.value] ?? 0)
          return (
            <button
              key={s.value}
              onClick={() => updateParams("status", s.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                active
                  ? "bg-surface-0 text-navy-700 shadow-xs"
                  : "text-surface-500 hover:text-navy-600"
              )}
            >
              {s.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  active ? "bg-navy-50 text-navy-600" : "bg-surface-200/60 text-surface-400"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
        <input
          type="text"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            updateParams("q", e.target.value)
          }}
          className={cn(
            "w-full pl-8 pr-8 py-2 text-sm rounded-lg",
            "bg-surface-0 border border-surface-200 text-navy-700 placeholder:text-surface-400",
            "focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100",
            "transition-all"
          )}
        />
        {search && (
          <button
            onClick={() => {
              setSearch("")
              updateParams("q", null)
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
