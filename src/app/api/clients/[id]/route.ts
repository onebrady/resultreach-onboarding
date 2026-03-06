import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

/**
 * DELETE /api/clients/[id] — Permanently delete a client and all related data
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    // Verify client exists first
    const client = await prisma.client.findUnique({
      where: { id },
      select: { id: true, companyName: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Cascade delete handles all related records
    await prisma.client.delete({ where: { id } })

    return NextResponse.json({ success: true, deleted: client.companyName })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error"
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 })
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

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
 * PATCH /api/clients/[id] — Update client details (safe fields only)
 *
 * Only allows editing contact/company info fields.
 * Status, relationships, and timestamps are never writable here.
 */
const EDITABLE_FIELDS = new Set([
  "companyName",
  "contactName",
  "contactEmail",
  "contactPhone",
  "industry",
  "websiteUrl",
  "status", // allowed for admin actions like "Mark Reviewed"
])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()

    // Strip any fields that aren't in the safe-edit whitelist
    const safeData: Record<string, unknown> = {}
    for (const key of Object.keys(body)) {
      if (EDITABLE_FIELDS.has(key)) {
        safeData[key] = body[key]
      }
    }

    if (Object.keys(safeData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const client = await prisma.client.update({
      where: { id },
      data: safeData,
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
