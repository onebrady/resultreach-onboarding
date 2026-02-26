import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isTokenExpired } from "@/lib/tokens"
import { sendCompletionNotification } from "@/lib/email"

/**
 * Validate token and return client info + current submission state
 */
async function validateToken(token: string) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: {
      client: {
        include: {
          submission: true,
          createdBy: { select: { email: true } },
          assignedTo: { select: { email: true } },
        },
      },
    },
  })

  if (!invite) return null
  if (isTokenExpired(invite.expiresAt)) return null
  if (invite.client.status === "submitted" || invite.client.status === "reviewed") {
    return { expired: false, alreadySubmitted: true, client: invite.client }
  }

  return { expired: false, alreadySubmitted: false, client: invite.client, invite }
}

/**
 * GET /api/onboard/[token] — Load form state
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = await validateToken(token)

    if (!result) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 })
    }

    if (result.alreadySubmitted) {
      return NextResponse.json({ error: "Already submitted", submitted: true }, { status: 410 })
    }

    const { client } = result
    return NextResponse.json({
      companyName: client.companyName,
      contactName: client.contactName,
      submission: client.submission,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/onboard/[token] — Save progress (auto-save / step save)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = await validateToken(token)

    if (!result || result.alreadySubmitted) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 })
    }

    const body = await req.json()
    const { step, data, markComplete } = body

    // Build update payload
    const updateData: Record<string, unknown> = {
      ...data,
      lastSavedAt: new Date(),
      currentStep: step,
    }

    // Mark step complete if requested
    if (markComplete && result.client.submission) {
      const completed = (result.client.submission.completedSteps as number[]) || []
      if (!completed.includes(step)) {
        updateData.completedSteps = [...completed, step].sort()
      }
    }

    // Update the submission
    const submission = await prisma.submission.update({
      where: { clientId: result.client.id },
      data: updateData,
    })

    // Mark client as in_progress if still invited
    if (result.client.status === "invited") {
      await prisma.client.update({
        where: { id: result.client.id },
        data: { status: "in_progress" },
      })

      // Mark token as used
      if (result.invite && !result.invite.usedAt) {
        await prisma.inviteToken.update({
          where: { id: result.invite.id },
          data: { usedAt: new Date() },
        })
      }
    }

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
}

/**
 * POST /api/onboard/[token] — Final submit
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = await validateToken(token)

    if (!result || result.alreadySubmitted) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 })
    }

    // Mark submission as submitted
    await prisma.submission.update({
      where: { clientId: result.client.id },
      data: { submittedAt: new Date() },
    })

    // Update client status
    await prisma.client.update({
      where: { id: result.client.id },
      data: { status: "submitted" },
    })

    // Notify the team
    const notifyEmail =
      result.client.assignedTo?.email ||
      result.client.createdBy?.email ||
      process.env.EMAIL_FROM

    if (notifyEmail) {
      await sendCompletionNotification(result.client.id, notifyEmail).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "Submit failed" }, { status: 500 })
  }
}
