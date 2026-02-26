import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { UserPlus, Users, Mail, Shield } from "lucide-react"
import { InviteUserForm } from "@/components/admin/invite-user-form"
import { ResendUserInvite } from "@/components/admin/resend-user-invite"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { clients: true, assignments: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            Team Members
          </h1>
          <p className="text-surface-500 mt-1">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Invite Form */}
      <Card>
        <CardContent className="py-5">
          <h2 className="text-sm font-semibold text-navy-600 flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-brand-500" />
            Invite New Team Member
          </h2>
          <InviteUserForm />
        </CardContent>
      </Card>

      {/* User List */}
      <div className="space-y-3" data-stagger>
        {users.map((user) => (
          <Card key={user.id} hover>
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-navy-500">
                      {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-navy-700 truncate">{user.name}</h3>
                      <UserStatusBadge status={user.status} />
                      <RoleBadge role={user.role} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs text-surface-400">
                    <span>{user._count.assignments} assigned</span>
                  </div>
                  {user.status === "invited" && (
                    <ResendUserInvite userId={user.id} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function UserStatusBadge({ status }: { status: string }) {
  if (status === "active") return <Badge variant="success">Active</Badge>
  if (status === "invited") return <Badge variant="warning">Invited</Badge>
  if (status === "disabled") return <Badge variant="error">Disabled</Badge>
  return <Badge>{status}</Badge>
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-surface-400">
      <Shield className="w-2.5 h-2.5" />
      {role}
    </span>
  )
}
