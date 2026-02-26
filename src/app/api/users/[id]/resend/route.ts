import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { sendUserInviteEmail } from "@/lib/email"
import { generateInviteToken, getTokenExpiry } from "@/lib/tokens"

/**
 * POST /api/users/[id]/resend — Resend invite to a user
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      include: { userInvite: true },
    })

    if (user.status !== "invited") {
      return NextResponse.json({ error: "User has already activated their account" }, { status: 400 })
    }

    // Regenerate token
    const token = generateInviteToken()
    const expiresAt = getTokenExpiry()

    if (user.userInvite) {
      await prisma.userInviteToken.update({
        where: { id: user.userInvite.id },
        data: { token, expiresAt, usedAt: null },
      })
    } else {
      await prisma.userInviteToken.create({
        data: { token, expiresAt, userId: user.id },
      })
    }

    await sendUserInviteEmail(user.id, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Failed to resend invite" }, { status: 500 })
  }
}
