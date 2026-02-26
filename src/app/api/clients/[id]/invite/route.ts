import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { sendInviteEmail, sendReminderEmail } from "@/lib/email"

/**
 * POST /api/clients/[id]/invite — Send or resend invite email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const isReminder = body.reminder === true

    const client = await prisma.client.findUniqueOrThrow({
      where: { id },
      include: { inviteToken: true },
    })

    if (!client.inviteToken) {
      return NextResponse.json({ error: "No invite token found" }, { status: 400 })
    }

    const token = client.inviteToken.token

    if (isReminder) {
      await sendReminderEmail(id, token)
    } else {
      await sendInviteEmail(id, token)
    }

    return NextResponse.json({ success: true, type: isReminder ? "reminder" : "invite" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    console.error("Invite email error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
