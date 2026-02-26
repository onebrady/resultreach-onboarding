import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isTokenExpired } from "@/lib/tokens"
import { sendClientMessageNotification } from "@/lib/email"

/**
 * POST /api/onboard/[token]/message — Client sends a message from the form
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { content, formStep } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    // Validate token
    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: {
        client: {
          include: {
            createdBy: { select: { email: true } },
            assignedTo: { select: { email: true } },
          },
        },
      },
    })

    if (!invite || isTokenExpired(invite.expiresAt)) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 })
    }

    const client = invite.client

    // Save message
    const message = await prisma.message.create({
      data: {
        clientId: client.id,
        content: content.trim(),
        senderName: client.contactName,
        senderEmail: client.contactEmail,
        formStep: formStep || null,
      },
    })

    // Notify the team
    const notifyEmail =
      client.assignedTo?.email ||
      client.createdBy?.email ||
      process.env.EMAIL_FROM

    if (notifyEmail) {
      await sendClientMessageNotification(client.id, message.id, notifyEmail).catch(console.error)
    }

    return NextResponse.json({ success: true, messageId: message.id })
  } catch (error) {
    console.error("Message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
