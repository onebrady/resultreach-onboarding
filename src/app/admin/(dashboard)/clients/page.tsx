import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { ClientFilters } from "@/components/admin/client-filters"
import {
  Plus,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  Layers,
  User,
} from "lucide-react"

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

export default async function ClientsListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status || "all"
  const searchQuery = params.q || ""

  const allClients = await prisma.client.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true } },
      submission: {
        select: {
          currentStep: true,
          completedSteps: true,
          submittedAt: true,
          lastSavedAt: true,
        },
      },
      inviteToken: { select: { createdAt: true } },
      _count: { select: { emailLogs: true, assets: true, messages: true } },
    },
  })

  // Counts (always from full set)
  const counts: Record<string, number> = {
    all: allClients.length,
    invited: allClients.filter((c) => c.status === "invited").length,
    in_progress: allClients.filter((c) => c.status === "in_progress").length,
    submitted: allClients.filter((c) => c.status === "submitted").length,
    reviewed: allClients.filter((c) => c.status === "reviewed").length,
  }

  // Filter
  let filtered = allClients
  if (statusFilter !== "all") {
    filtered = filtered.filter((c) => c.status === statusFilter)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q)
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 font-display">Clients</h1>
          <p className="text-surface-500 mt-1">
            {allClients.length} client{allClients.length !== 1 ? "s" : ""} in pipeline
          </p>
        </div>
        <Link href="/admin/clients/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ClientFilters
        counts={counts}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState hasClients={allClients.length > 0} searchQuery={searchQuery} />
      ) : (
        <div className="space-y-2" data-stagger>
          {filtered.map((client) => {
            const completed = (client.submission?.completedSteps as number[]) || []
            const totalSteps = 7
            const now = new Date()

            return (
              <Link key={client.id} href={`/admin/clients/${client.id}`} className="block">
                <Card hover className="group">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Status indicator */}
                      <StatusIndicator
                        status={client.status}
                        completedSteps={completed.length}
                        totalSteps={totalSteps}
                      />

                      {/* Client info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-navy-700 group-hover:text-brand-600 transition-colors truncate">
                            {client.companyName}
                          </h3>
                          <StatusBadge status={client.status} />
                        </div>
                        <p className="text-xs text-surface-400 mt-0.5 truncate">
                          {client.contactName} · {client.contactEmail}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(client.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client._count.emailLogs} email{client._count.emailLogs !== 1 ? "s" : ""}
                          </span>
                          {client._count.assets > 0 && (
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {client._count.assets} file{client._count.assets !== 1 ? "s" : ""}
                            </span>
                          )}
                          {client.assignedTo && (
                            <span className="flex items-center gap-1 text-brand-500">
                              <User className="w-3 h-3" />
                              {client.assignedTo.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: context by status */}
                      <div className="shrink-0 text-right">
                        <StatusContext
                          status={client.status}
                          submission={client.submission}
                          inviteToken={client.inviteToken}
                          completedSteps={completed}
                          totalSteps={totalSteps}
                          now={now}
                        />
                      </div>

                      <ArrowRight className="w-4 h-4 text-surface-200 group-hover:text-brand-400 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Result count when filtered */}
      {(statusFilter !== "all" || searchQuery) && filtered.length > 0 && (
        <p className="text-xs text-surface-400 text-center">
          Showing {filtered.length} of {allClients.length} client{allClients.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

/* ── Status Indicator (left side visual) ─────────────────────── */

function StatusIndicator({
  status,
  completedSteps,
  totalSteps,
}: {
  status: string
  completedSteps: number
  totalSteps: number
}) {
  if (status === "submitted" || status === "reviewed") {
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      </div>
    )
  }

  if (status === "in_progress") {
    // Ring progress indicator
    const pct = Math.round((completedSteps / totalSteps) * 100)
    const circumference = 2 * Math.PI * 16
    const offset = circumference - (pct / 100) * circumference

    return (
      <div className="w-10 h-10 relative shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-surface-100"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-brand-500 transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-brand-600 tabular-nums">
          {completedSteps}
        </span>
      </div>
    )
  }

  // invited
  return (
    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
      <Send className="w-4 h-4 text-amber-500" />
    </div>
  )
}

/* ── Status Context (right side info) ────────────────────────── */

function StatusContext({
  status,
  submission,
  inviteToken,
  completedSteps,
  totalSteps,
  now,
}: {
  status: string
  submission: { submittedAt: Date | null; lastSavedAt: Date; currentStep: number } | null
  inviteToken: { createdAt: Date } | null
  completedSteps: number[]
  totalSteps: number
  now: Date
}) {
  if (status === "submitted" && submission?.submittedAt) {
    return (
      <div className="text-right">
        <p className="text-xs font-medium text-emerald-600">Submitted</p>
        <p className="text-[11px] text-surface-400 mt-0.5">{formatDate(submission.submittedAt)}</p>
      </div>
    )
  }

  if (status === "reviewed") {
    return (
      <div className="text-right">
        <p className="text-xs font-medium text-navy-500">Reviewed</p>
        <p className="text-[11px] text-surface-400 mt-0.5">Complete</p>
      </div>
    )
  }

  if (status === "in_progress") {
    const daysSince = submission?.lastSavedAt
      ? Math.floor((now.getTime() - submission.lastSavedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null
    const isStale = daysSince !== null && daysSince >= 2

    return (
      <div className="text-right">
        <p className="text-xs font-medium text-navy-600">
          {completedSteps.length}/{totalSteps} sections
        </p>
        {daysSince !== null && (
          <p className={`text-[11px] mt-0.5 ${isStale ? "text-amber-600 font-medium" : "text-surface-400"}`}>
            {isStale ? `${daysSince}d idle` : `Active ${formatRelativeTime(submission!.lastSavedAt)}`}
          </p>
        )}
      </div>
    )
  }

  // invited
  if (inviteToken) {
    const daysSince = Math.floor(
      (now.getTime() - inviteToken.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    const isStale = daysSince >= 2

    return (
      <div className="text-right">
        <p className={`text-xs font-medium ${isStale ? "text-amber-600" : "text-surface-500"}`}>
          {isStale ? `${daysSince}d waiting` : "Invited"}
        </p>
        <p className="text-[11px] text-surface-400 mt-0.5">
          Sent {formatRelativeTime(inviteToken.createdAt)}
        </p>
      </div>
    )
  }

  return null
}

/* ── Status Badge ────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  if (status === "submitted") return <Badge variant="success">Submitted</Badge>
  if (status === "in_progress") return <Badge variant="info">In Progress</Badge>
  if (status === "invited") return <Badge variant="warning">Invited</Badge>
  if (status === "reviewed") return <Badge>Reviewed</Badge>
  return <Badge>{status}</Badge>
}

/* ── Empty State ─────────────────────────────────────────────── */

function EmptyState({ hasClients, searchQuery }: { hasClients: boolean; searchQuery: string }) {
  if (searchQuery) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5 text-surface-400" />
          </div>
          <p className="text-sm font-medium text-navy-600">No matches</p>
          <p className="text-xs text-surface-400 mt-1">
            No clients match &quot;{searchQuery}&quot;
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!hasClients) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-surface-400" />
          </div>
          <h3 className="text-sm font-semibold text-navy-600">No clients yet</h3>
          <p className="text-sm text-surface-400 mt-1">Create your first client to begin onboarding.</p>
          <Link href="/admin/clients/new" className="mt-4 inline-block">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add First Client
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-sm text-surface-400">No clients in this status.</p>
      </CardContent>
    </Card>
  )
}
