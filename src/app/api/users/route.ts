import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { generateInviteToken, getTokenExpiry } from "@/lib/tokens"
import { sendUserInviteEmail } from "@/lib/email"
import { z } from "zod"

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().optional(),
})

/**
 * GET /api/users — List all admin users
 */
export async function GET() {
  try {
    await requireAdmin()

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

    return NextResponse.json(users)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/users — Create a new user + send invite email
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const data = createUserSchema.parse(body)

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }

    const token = generateInviteToken()
    const expiresAt = getTokenExpiry()

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || "admin",
        status: "invited",
        passwordHash: null,
        userInvite: {
          create: {
            token,
            expiresAt,
          },
        },
      },
      include: { userInvite: true },
    })

    // Send invite email
    await sendUserInviteEmail(user.id, token)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
