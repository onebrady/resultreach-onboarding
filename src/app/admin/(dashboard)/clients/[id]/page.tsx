import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ClientActions } from "@/components/admin/client-actions"
import { EditClientDetails } from "@/components/admin/edit-client-details"
import {
  Building2, User, Mail, Phone, Globe, Calendar, Clock,
  ArrowLeft, CheckCircle2, AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      createdBy: { select: { name: true } },
      submission: true,
      inviteToken: { select: { token: true, expiresAt: true, usedAt: true } },
      assets: true,
      emailLogs: { orderBy: { sentAt: "desc" }, take: 20 },
    },
  })

  if (!client) notFound()

  const sub = client.submission
  const completedSteps = (sub?.completedSteps as number[]) || []
  const progress = Math.round((completedSteps.length / 7) * 100)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const inviteLink = client.inviteToken ? `${appUrl}/onboard/${client.inviteToken.token}` : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/admin/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-navy-500 font-display">{client.companyName}</h1>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-surface-500 text-sm mt-1">
              Created {formatDate(client.createdAt)} by {client.createdBy?.name || "Unknown"}
            </p>
          </div>
        </div>
        <ClientActions clientId={client.id} status={client.status} companyName={client.companyName} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy-600">Onboarding Progress</h2>
                <span className="text-sm font-bold text-brand-600">{progress}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                  const labels = ["Company", "Services", "SWOT", "Contacts", "Marketing", "Platforms", "Goals"]
                  const done = completedSteps.includes(step)
                  return (
                    <div key={step} className="text-center">
                      <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-xs font-bold ${
                        done ? "bg-emerald-100 text-emerald-600" : "bg-surface-100 text-surface-400"
                      }`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : step}
                      </div>
                      <span className="text-[10px] text-surface-400 mt-1 block">{labels[step - 1]}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submission Data */}
          {sub ? (
            <div className="space-y-4">
              <SubmissionSection title="Company Profile" step={1} completed={completedSteps}>
                <Field label="Legal Name" value={sub.companyLegalName} />
                <Field label="Target Territory" value={sub.targetTerritory} long />
                <Field label="Industries" value={sub.industries} long />
              </SubmissionSection>

              <SubmissionSection title="Services & Differentiators" step={2} completed={completedSteps}>
                <Field label="Services" value={sub.services} long />
                <Field label="Specialized Services" value={sub.specializedServices} long />
              </SubmissionSection>

              <SubmissionSection title="SWOT Analysis" step={3} completed={completedSteps}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Strengths" value={sub.strengths} long color="emerald" />
                  <Field label="Weaknesses" value={sub.weaknesses} long color="amber" />
                  <Field label="Opportunities" value={sub.opportunities} long color="blue" />
                  <Field label="Threats" value={sub.threats} long color="red" />
                </div>
              </SubmissionSection>

              <SubmissionSection title="Team & Contacts" step={4} completed={completedSteps}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ContactCard label="Decision Maker" data={sub.decisionMaker as Record<string, string> | null} />
                  <ContactCard label="Marketing" data={sub.marketingContact as Record<string, string> | null} />
                  <ContactCard label="Sales" data={sub.salesContact as Record<string, string> | null} />
                  <ContactCard label="Operations" data={sub.operationsContact as Record<string, string> | null} />
                </div>
                <Field label="Preferred Communication" value={sub.preferredComm} />
              </SubmissionSection>

              <SubmissionSection title="Current Marketing" step={5} completed={completedSteps}>
                <Field label="Active Channels" value={Array.isArray(sub.activeChannels) ? (sub.activeChannels as string[]).join(", ") : null} />
                <Field label="Monthly Budget" value={sub.monthlyBudget} />
                <Field label="Best Performing" value={sub.bestPerforming} long />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="CRM System" value={sub.crmSystem} />
                  <Field label="ERP System" value={sub.erpSystem} />
                </div>
                <Field label="CRM Maturity" value={sub.crmMaturity} />
              </SubmissionSection>

              <SubmissionSection title="Platform Access" step={6} completed={completedSteps}>
                {sub.platformAccess ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(sub.platformAccess as Record<string, string>).map(([platform, status]) => (
                      <div key={platform} className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5">
                        <span className="text-xs font-medium text-navy-600 capitalize">{platform.replace(/_/g, " ")}</span>
                        <PlatformBadge status={status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-400 italic">Not started</p>
                )}
              </SubmissionSection>

              <SubmissionSection title="Goals & Priorities" step={7} completed={completedSteps}>
                <Field label="6-Month Goals" value={sub.sixMonthGoals} long />
                <Field label="Website Changes" value={sub.websiteChanges} long />
                <Field label="Additional Notes" value={sub.additionalNotes} long />
              </SubmissionSection>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-8 h-8 text-surface-300 mx-auto mb-3" />
                <p className="text-sm text-surface-400">No submission data yet. The client hasn&apos;t started their form.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-4">
          {/* Client Info (editable) */}
          <EditClientDetails
            client={{
              id: client.id,
              companyName: client.companyName,
              contactName: client.contactName,
              contactEmail: client.contactEmail,
              contactPhone: client.contactPhone,
              industry: client.industry,
              websiteUrl: client.websiteUrl,
              createdAt: client.createdAt.toISOString(),
              assignedTo: client.assignedTo,
            }}
          />

          {/* Invite Link */}
          {inviteLink && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-navy-600">Invite Link</h3>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-surface-50 border border-surface-200 p-3">
                  <code className="text-xs text-surface-600 break-all">{inviteLink}</code>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-surface-400">
                  <Clock className="w-3 h-3" />
                  {client.inviteToken?.expiresAt
                    ? `Expires ${formatDate(client.inviteToken.expiresAt)}`
                    : "No expiry set"}
                </div>
                {client.inviteToken?.usedAt && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" />
                    First accessed {formatDate(client.inviteToken.usedAt)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Email History */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-navy-600">Email History</h3>
            </CardHeader>
            <CardContent>
              {client.emailLogs.length === 0 ? (
                <p className="text-sm text-surface-400">No emails sent yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {client.emailLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-xs">
                      <Mail className="w-3 h-3 text-surface-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-navy-600 capitalize">{log.type.replace(/_/g, " ")}</span>
                        <span className="text-surface-400"> to {log.recipient}</span>
                        <p className="text-surface-300 mt-0.5">{formatDate(log.sentAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "submitted") return <Badge variant="success">Submitted</Badge>
  if (status === "in_progress") return <Badge variant="info">In Progress</Badge>
  if (status === "invited") return <Badge variant="warning">Invited</Badge>
  if (status === "reviewed") return <Badge>Reviewed</Badge>
  return <Badge>{status}</Badge>
}

function PlatformBadge({ status }: { status: string }) {
  if (status === "granted") return <Badge variant="success">Granted</Badge>
  if (status === "pending") return <Badge variant="warning">Pending</Badge>
  if (status === "need_help") return <Badge variant="info">Needs Help</Badge>
  return <Badge variant="default">N/A</Badge>
}

function InfoRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-surface-400 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-surface-400 block">{label}</span>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline truncate block">{value}</a>
        ) : (
          <span className="text-sm text-navy-700 block truncate">{value}</span>
        )}
      </div>
    </div>
  )
}

function SubmissionSection({ title, step, completed, children }: {
  title: string; step: number; completed: number[]; children: React.ReactNode
}) {
  const done = completed.includes(step)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
            done ? "bg-emerald-100 text-emerald-600" : "bg-surface-100 text-surface-400"
          }`}>
            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
          </div>
          <h2 className="text-sm font-semibold text-navy-600">{title}</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

function Field({ label, value, long, color }: {
  label: string; value: string | null | undefined; long?: boolean; color?: string
}) {
  const colorClasses: Record<string, string> = {
    emerald: "border-l-emerald-400",
    amber: "border-l-amber-400",
    blue: "border-l-brand-400",
    red: "border-l-red-400",
  }

  if (!value) {
    return (
      <div>
        <span className="text-xs text-surface-400 block">{label}</span>
        <span className="text-sm text-surface-300 italic">Not provided</span>
      </div>
    )
  }

  return (
    <div className={color ? `border-l-2 pl-3 ${colorClasses[color] || ""}` : ""}>
      <span className="text-xs text-surface-400 block mb-0.5">{label}</span>
      {long ? (
        <p className="text-sm text-navy-700 whitespace-pre-wrap">{value}</p>
      ) : (
        <span className="text-sm text-navy-700">{value}</span>
      )}
    </div>
  )
}

function ContactCard({ label, data }: { label: string; data: Record<string, string> | null }) {
  if (!data || !data.name) {
    return (
      <div className="rounded-lg border border-surface-100 p-3">
        <span className="text-xs text-surface-400">{label}</span>
        <p className="text-sm text-surface-300 italic mt-0.5">Not provided</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-surface-200 p-3">
      <span className="text-[10px] uppercase tracking-wider text-surface-400">{label}</span>
      <p className="text-sm font-medium text-navy-700 mt-0.5">{data.name}</p>
      {data.role && <p className="text-xs text-surface-500">{data.role}</p>}
      {data.email && <p className="text-xs text-brand-500 mt-1">{data.email}</p>}
      {data.phone && <p className="text-xs text-surface-400">{data.phone}</p>}
    </div>
  )
}
