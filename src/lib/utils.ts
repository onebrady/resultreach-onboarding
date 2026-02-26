import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "invited": return "bg-amber-100 text-amber-800"
    case "in_progress": return "bg-blue-100 text-blue-800"
    case "submitted": return "bg-emerald-100 text-emerald-800"
    case "reviewed": return "bg-slate-100 text-slate-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "invited": return "Invited"
    case "in_progress": return "In Progress"
    case "submitted": return "Submitted"
    case "reviewed": return "Reviewed"
    default: return status
  }
}
