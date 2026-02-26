import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

/**
 * GET /api/clients/[id] — Get full client detail with submission
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const client = await prisma.client.findUniqueOrThrow({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        submission: true,
        inviteToken: { select: { token: true, expiresAt: true, usedAt: true } },
        assets: true,
        emailLogs: { orderBy: { sentAt: "desc" }, take: 20 },
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }
}

/**
 * PATCH /api/clients/[id] — Update client info
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    const client = await prisma.client.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(client)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Update failed" }, { status: 400 })
  }
}
