import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import {
  ArrowRight,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserPlus,
  MessageSquare,
  FileText,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  const [allClients, recentEmails, unreadMessages] = await Promise.all([
    prisma.client.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        submission: {
          select: { currentStep: true, completedSteps: true, submittedAt: true, lastSavedAt: true },
        },
        inviteToken: { select: { createdAt: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.emailLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 5,
      include: { client: { select: { companyName: true } } },
    }),
    prisma.message.count({ where: { readAt: null } }),
  ])

  // Pipeline counts
  const pipeline = {
    invited: allClients.filter((c) => c.status === "invited"),
    inProgress: allClients.filter((c) => c.status === "in_progress"),
    submitted: allClients.filter((c) => c.status === "submitted"),
    reviewed: allClients.filter((c) => c.status === "reviewed"),
  }

  // Needs attention: invited > 2 days ago OR in_progress with no activity for 2+ days
  const staleClients = allClients.filter((c) => {
    if (c.status === "invited" && c.inviteToken) {
      return c.inviteToken.createdAt < twoDaysAgo
    }
    if (c.status === "in_progress" && c.submission) {
      return c.submission.lastSavedAt < twoDaysAgo
    }
    return false
  })

  const totalClients = allClients.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 font-display">
            Onboarding
          </h1>
          <p className="text-surface-500 mt-1">
            {totalClients} client{totalClients !== 1 ? "s" : ""} in pipeline
          </p>
        </div>
        <Link href="/admin/clients/new">
          <Button>
            <UserPlus className="w-4 h-4" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Pipeline Flow */}
      <PipelineFlow
        invited={pipeline.invited.length}
        inProgress={pipeline.inProgress.length}
        submitted={pipeline.submitted.length}
        reviewed={pipeline.reviewed.length}
        total={totalClients}
      />

      {/* Two-column layout: Attention + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Needs Attention — wider, it's the primary action area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Needs Attention
            </h2>
            {staleClients.length > 0 && (
              <span className="text-xs text-surface-400">{staleClients.length} stalled</span>
            )}
          </div>

          {staleClients.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-navy-600">All clear</p>
                <p className="text-xs text-surface-400 mt-1">
                  No clients need a nudge right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2" data-stagger>
              {staleClients.slice(0, 5).map((client) => {
                const daysSinceActivity = Math.floor(
                  (now.getTime() -
                    (client.status === "invited"
                      ? client.inviteToken!.createdAt.getTime()
                      : client.submission!.lastSavedAt.getTime())) /
                    (1000 * 60 * 60 * 24)
                )
                const completedSteps = (client.submission?.completedSteps as number[]) || []

                return (
                  <Link key={client.id} href={`/admin/clients/${client.id}`}>
                    <Card hover className="group">
                      <CardContent className="py-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-navy-700 group-hover:text-brand-600 transition-colors truncate">
                                {client.companyName}
                              </p>
                              <StatusBadge status={client.status} />
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                              <span className="flex items-center gap-1 text-amber-600 font-medium">
                                <Clock className="w-3 h-3" />
                                {daysSinceActivity}d idle
                              </span>
                              {client.status === "in_progress" && (
                                <span>{completedSteps.length}/7 sections</span>
                              )}
                              {client.contactName && (
                                <span className="truncate">{client.contactName}</span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-brand-500 transition-colors shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
              {staleClients.length > 5 && (
                <Link href="/admin/clients" className="block">
                  <p className="text-xs text-brand-500 font-medium text-center py-2 hover:underline">
                    View all {staleClients.length} stalled clients →
                  </p>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right column: Activity + Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unread Messages */}
          {unreadMessages > 0 && (
            <Card className="border-brand-200 bg-brand-50/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-700">
                      {unreadMessages} unread message{unreadMessages !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">From onboarding forms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <div>
            <h2 className="text-sm font-semibold text-navy-600 mb-3">Recent Activity</h2>
            <Card>
              <CardContent className="py-2">
                {recentEmails.length === 0 ? (
                  <p className="text-xs text-surface-400 py-4 text-center">No recent activity.</p>
                ) : (
                  <div className="divide-y divide-surface-100">
                    {recentEmails.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 py-3 first:pt-2 last:pb-2">
                        <div className="mt-0.5 shrink-0">
                          <EmailTypeIcon type={log.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-navy-700 truncate">
                            {log.client.companyName}
                          </p>
                          <p className="text-[11px] text-surface-400 truncate mt-0.5">
                            {emailTypeLabel(log.type)} → {log.recipient}
                          </p>
                        </div>
                        <span className="text-[11px] text-surface-300 shrink-0 tabular-nums">
                          {formatRelativeTime(log.sentAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/clients">
              <Card hover className="group cursor-pointer">
                <CardContent className="py-3.5 text-center">
                  <FileText className="w-4 h-4 text-surface-400 group-hover:text-brand-500 transition-colors mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-navy-600">All Clients</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/users">
              <Card hover className="group cursor-pointer">
                <CardContent className="py-3.5 text-center">
                  <UserPlus className="w-4 h-4 text-surface-400 group-hover:text-brand-500 transition-colors mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-navy-600">Team</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Pipeline Visualization ──────────────────────────────────── */

function PipelineFlow({
  invited,
  inProgress,
  submitted,
  reviewed,
  total,
}: {
  invited: number
  inProgress: number
  submitted: number
  reviewed: number
  total: number
}) {
  const stages = [
    { label: "Invited", count: invited, color: "bg-amber-400", textColor: "text-amber-700", bgColor: "bg-amber-50" },
    { label: "In Progress", count: inProgress, color: "bg-brand-400", textColor: "text-brand-700", bgColor: "bg-brand-50" },
    { label: "Submitted", count: submitted, color: "bg-emerald-400", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
    { label: "Reviewed", count: reviewed, color: "bg-navy-300", textColor: "text-navy-600", bgColor: "bg-navy-50" },
  ]

  return (
    <Card>
      <CardContent className="py-5">
        {/* Stage bar */}
        <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-surface-100 mb-5">
          {stages.map((stage) =>
            stage.count > 0 ? (
              <div
                key={stage.label}
                className={`h-full ${stage.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${(stage.count / Math.max(total, 1)) * 100}%`, minWidth: "8px" }}
              />
            ) : null
          )}
        </div>

        {/* Stage counts */}
        <div className="grid grid-cols-4 gap-3">
          {stages.map((stage) => (
            <div
              key={stage.label}
              className={`rounded-lg px-3 py-3 ${stage.bgColor} text-center`}
            >
              <p className={`text-xl font-bold tabular-nums ${stage.textColor}`}>
                {stage.count}
              </p>
              <p className="text-[11px] font-medium text-surface-500 mt-0.5">
                {stage.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Status Badge ────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  if (status === "submitted") return <Badge variant="success">Submitted</Badge>
  if (status === "in_progress") return <Badge variant="info">In Progress</Badge>
  if (status === "invited") return <Badge variant="warning">Invited</Badge>
  if (status === "reviewed") return <Badge>Reviewed</Badge>
  return <Badge>{status}</Badge>
}

/* ── Email helpers ───────────────────────────────────────────── */

function EmailTypeIcon({ type }: { type: string }) {
  const base = "w-7 h-7 rounded-md flex items-center justify-center"
  if (type === "invite")
    return (
      <div className={`${base} bg-amber-50`}>
        <Send className="w-3.5 h-3.5 text-amber-600" />
      </div>
    )
  if (type === "reminder")
    return (
      <div className={`${base} bg-brand-50`}>
        <Clock className="w-3.5 h-3.5 text-brand-600" />
      </div>
    )
  if (type === "completion")
    return (
      <div className={`${base} bg-emerald-50`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
    )
  return (
    <div className={`${base} bg-surface-100`}>
      <Mail className="w-3.5 h-3.5 text-surface-500" />
    </div>
  )
}

function emailTypeLabel(type: string): string {
  switch (type) {
    case "invite": return "Invite sent"
    case "reminder": return "Reminder"
    case "completion": return "Completion notice"
    case "internal_notification": return "Internal alert"
    default: return type
  }
}
