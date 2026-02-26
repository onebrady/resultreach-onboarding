import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { Plus, Mail, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default async function ClientsListPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true } },
      submission: { select: { currentStep: true, completedSteps: true, submittedAt: true } },
      _count: { select: { emailLogs: true, assets: true } },
    },
  })

  const statusCounts = {
    all: clients.length,
    invited: clients.filter((c) => c.status === "invited").length,
    in_progress: clients.filter((c) => c.status === "in_progress").length,
    submitted: clients.filter((c) => c.status === "submitted").length,
    reviewed: clients.filter((c) => c.status === "reviewed").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 font-display">Clients</h1>
          <p className="text-surface-500 mt-1">{statusCounts.all} total clients in onboarding pipeline</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill label="All" count={statusCounts.all} active />
        <FilterPill label="Invited" count={statusCounts.invited} />
        <FilterPill label="In Progress" count={statusCounts.in_progress} />
        <FilterPill label="Submitted" count={statusCounts.submitted} />
        <FilterPill label="Reviewed" count={statusCounts.reviewed} />
      </div>

      {/* Client list */}
      {clients.length === 0 ? (
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
      ) : (
        <div className="space-y-3" data-stagger>
          {clients.map((client) => {
            const completed = (client.submission?.completedSteps as number[]) || []
            const progress = Math.round((completed.length / 7) * 100)

            return (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <Card hover className="group">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Company info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-semibold text-navy-700 group-hover:text-brand-600 transition-colors truncate">
                            {client.companyName}
                          </h3>
                          <StatusBadge status={client.status} />
                        </div>
                        <p className="text-xs text-surface-400 mt-1 truncate">
                          {client.contactName} &middot; {client.contactEmail}
                        </p>
                        <div className="flex items-center gap-4 mt-2.5 text-xs text-surface-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created {formatRelativeTime(client.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client._count.emailLogs} emails
                          </span>
                          {client.assignedTo && (
                            <span className="text-brand-500">{client.assignedTo.name}</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Progress */}
                      <div className="text-right shrink-0 w-28">
                        {client.submission?.submittedAt ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Submitted {formatDate(client.submission.submittedAt)}
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs text-surface-400">{progress}% complete</span>
                            <div className="h-1.5 w-full bg-surface-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-surface-300 mt-0.5 block">
                              {completed.length}/7 sections
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, count, active }: { label: string; count: number; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
        active
          ? "bg-navy-500 text-white border-navy-500"
          : "bg-surface-0 text-surface-500 border-surface-200 hover:border-surface-300"
      }`}
    >
      {label}
      <span className={`${active ? "bg-white/20" : "bg-surface-100"} rounded-full px-1.5 py-0.5 text-[10px]`}>
        {count}
      </span>
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "submitted") return <Badge variant="success">Submitted</Badge>
  if (status === "in_progress") return <Badge variant="info">In Progress</Badge>
  if (status === "invited") return <Badge variant="warning">Invited</Badge>
  if (status === "reviewed") return <Badge>Reviewed</Badge>
  return <Badge>{status}</Badge>
}
