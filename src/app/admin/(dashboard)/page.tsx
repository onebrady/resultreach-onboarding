import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const [clients, emailCount] = await Promise.all([
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { submission: true },
    }),
    prisma.emailLog.count(),
  ])

  const stats = {
    total: await prisma.client.count(),
    invited: await prisma.client.count({ where: { status: "invited" } }),
    inProgress: await prisma.client.count({ where: { status: "in_progress" } }),
    submitted: await prisma.client.count({ where: { status: "submitted" } }),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 font-display">Onboarding Dashboard</h1>
          <p className="text-surface-500 mt-1">Track client onboarding progress and email activity.</p>
        </div>
        <Link href="/admin/clients">
          <Button>Manage Clients</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={stats.total} color="text-navy-600" />
        <StatCard label="Invited" value={stats.invited} color="text-amber-600" />
        <StatCard label="In Progress" value={stats.inProgress} color="text-brand-600" />
        <StatCard label="Submitted" value={stats.submitted} color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-navy-600">Recent Clients</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.length === 0 && (
                <p className="text-sm text-surface-400">No clients yet.</p>
              )}
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="block rounded-lg border border-surface-100 p-3 hover:border-surface-200 hover:bg-surface-50 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-600">{client.companyName}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{client.contactName} • {client.contactEmail}</p>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-navy-600">Email Activity</h2>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-600">{emailCount}</p>
            <p className="text-sm text-surface-500 mt-1">Total transactional emails sent</p>
            <p className="text-xs text-surface-400 mt-4">Last updated: {formatDate(new Date())}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs text-surface-400 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "submitted") return <Badge variant="success">Submitted</Badge>
  if (status === "in_progress") return <Badge variant="info">In Progress</Badge>
  if (status === "invited") return <Badge variant="warning">Invited</Badge>
  return <Badge>{status}</Badge>
}
