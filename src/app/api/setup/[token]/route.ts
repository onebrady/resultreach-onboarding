import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isTokenExpired } from "@/lib/tokens"
import bcrypt from "bcryptjs"

/**
 * GET /api/setup/[token] — Validate token, return user info
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invite = await prisma.userInviteToken.findUnique({
      where: { token },
      include: { user: { select: { name: true, email: true, status: true } } },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 404 })
    }
    if (isTokenExpired(invite.expiresAt)) {
      return NextResponse.json({ error: "This invite has expired. Please contact your administrator." }, { status: 410 })
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: "This invite has already been used." }, { status: 410 })
    }

    return NextResponse.json({
      name: invite.user.name,
      email: invite.user.email,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/**
 * POST /api/setup/[token] — Set password and activate account
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { password } = await req.json()

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const invite = await prisma.userInviteToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite link" }, { status: 404 })
    }
    if (isTokenExpired(invite.expiresAt)) {
      return NextResponse.json({ error: "This invite has expired" }, { status: 410 })
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: "This invite has already been used" }, { status: 410 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Activate the user
    await prisma.user.update({
      where: { id: invite.userId },
      data: { passwordHash, status: "active" },
    })

    // Mark token as used
    await prisma.userInviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 })
  }
}
