import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { createClientSchema } from "@/lib/validations"
import { generateInviteToken, getTokenExpiry } from "@/lib/tokens"

/**
 * GET /api/clients — List all clients
 */
export async function GET() {
  try {
    await requireAdmin()

    const clients = await prisma.client.findMany({
      include: {
        assignedTo: { select: { id: true, name: true } },
        submission: { select: { currentStep: true, completedSteps: true, submittedAt: true } },
        _count: { select: { emailLogs: true, assets: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(clients)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/clients — Create a new client + generate invite token
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const body = await req.json()
    const data = createClientSchema.parse(body)

    const token = generateInviteToken()
    const expiresAt = getTokenExpiry()

    const client = await prisma.client.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || null,
        industry: data.industry || null,
        websiteUrl: data.websiteUrl || null,
        createdById: session.user!.id,
        assignedToId: data.assignedToId || null,
        inviteToken: {
          create: {
            token,
            expiresAt,
          },
        },
        submission: {
          create: {},
        },
      },
      include: {
        inviteToken: true,
        assignedTo: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
