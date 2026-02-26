import { Resend } from "resend"
import { prisma } from "./prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || "onboarding@resultreach.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ResultReach"

// ─── Email Templates ────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #F4F6F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #FFFFFF; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .logo-bar { text-align: center; padding-bottom: 32px; border-bottom: 1px solid #E5E7EB; margin-bottom: 32px; }
    .logo-text { font-size: 24px; font-weight: 700; color: #1B3A5C; letter-spacing: -0.02em; }
    .logo-accent { color: #2A7CC7; }
    h1 { color: #1B3A5C; font-size: 22px; font-weight: 700; margin: 0 0 16px; line-height: 1.3; }
    p { color: #4B5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #2A7CC7; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .btn:hover { background: #2369A8; }
    .footer { text-align: center; padding-top: 32px; margin-top: 32px; border-top: 1px solid #E5E7EB; }
    .footer p { color: #9CA3AF; font-size: 13px; }
    .accent { color: #F5A623; font-weight: 600; }
    .highlight-box { background: #F0F7FF; border-left: 4px solid #2A7CC7; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight-box p { margin: 0; color: #1B3A5C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-bar">
        <span class="logo-text">Result<span class="logo-accent">Reach</span></span>
      </div>
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ─── Send Functions ─────────────────────────────────────────────

/**
 * Send onboarding invite to a new client
 */
export async function sendInviteEmail(clientId: string, token: string) {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
  })

  const link = `${APP_URL}/onboard/${token}`

  const html = baseTemplate(`
    <h1>Welcome to ${APP_NAME} Onboarding</h1>
    <p>Hi ${client.contactName},</p>
    <p>We're excited to begin working together! To get started, we need some key information about your business that will help us build the most effective strategy for you.</p>
    <div class="highlight-box">
      <p>This questionnaire takes about <span class="accent">15–20 minutes</span> to complete. You can save your progress and return anytime.</p>
    </div>
    <p>Click below to begin your onboarding:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${link}" class="btn">Start Onboarding →</a>
    </p>
    <p style="color: #9CA3AF; font-size: 13px;">This link is unique to you. Please don't share it with others. If you have any questions, reply to this email.</p>
  `)

  const result = await resend.emails.send({
    from: FROM,
    to: client.contactEmail,
    subject: `${APP_NAME} — Let's Get Started`,
    html,
  })

  // Log the email
  await prisma.emailLog.create({
    data: {
      clientId,
      type: "invite",
      recipient: client.contactEmail,
      subject: `${APP_NAME} — Let's Get Started`,
      resendId: result.data?.id || null,
      status: result.error ? "failed" : "sent",
    },
  })

  return result
}

/**
 * Send reminder to client with incomplete onboarding
 */
export async function sendReminderEmail(clientId: string, token: string) {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    include: { submission: true },
  })

  const link = `${APP_URL}/onboard/${token}`
  const completedSteps = (client.submission?.completedSteps as number[]) || []
  const progress = Math.round((completedSteps.length / 7) * 100)

  const html = baseTemplate(`
    <h1>Just a Friendly Reminder</h1>
    <p>Hi ${client.contactName},</p>
    <p>We noticed your onboarding questionnaire is ${progress > 0 ? `<span class="accent">${progress}% complete</span>` : "still waiting for you"}. Completing this helps us hit the ground running with your marketing strategy.</p>
    ${progress > 0 ? `
    <div class="highlight-box">
      <p>Great progress! You've completed ${completedSteps.length} of 7 sections. Pick up right where you left off.</p>
    </div>` : ""}
    <p style="text-align: center; margin: 24px 0;">
      <a href="${link}" class="btn">${progress > 0 ? "Continue Onboarding" : "Start Onboarding"} →</a>
    </p>
    <p style="color: #9CA3AF; font-size: 13px;">If you need help or have questions, just reply to this email.</p>
  `)

  const result = await resend.emails.send({
    from: FROM,
    to: client.contactEmail,
    subject: `${APP_NAME} — Your Onboarding Awaits`,
    html,
  })

  await prisma.emailLog.create({
    data: {
      clientId,
      type: "reminder",
      recipient: client.contactEmail,
      subject: `${APP_NAME} — Your Onboarding Awaits`,
      resendId: result.data?.id || null,
      status: result.error ? "failed" : "sent",
    },
  })

  return result
}

/**
 * Notify internal team when a client completes onboarding
 */
export async function sendCompletionNotification(clientId: string, teamEmail: string) {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    include: { assignedTo: true },
  })

  const adminLink = `${APP_URL}/admin/clients/${clientId}`

  const html = baseTemplate(`
    <h1>🎉 Onboarding Complete</h1>
    <p><strong>${client.companyName}</strong> has completed their pregame onboarding questionnaire.</p>
    <div class="highlight-box">
      <p><strong>Contact:</strong> ${client.contactName} (${client.contactEmail})</p>
      ${client.assignedTo ? `<p><strong>Assigned to:</strong> ${client.assignedTo.name}</p>` : ""}
    </div>
    <p>Review their submission and prepare for kickoff:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${adminLink}" class="btn">View Submission →</a>
    </p>
  `)

  const result = await resend.emails.send({
    from: FROM,
    to: teamEmail,
    subject: `✅ ${client.companyName} — Onboarding Complete`,
    html,
  })

  await prisma.emailLog.create({
    data: {
      clientId,
      type: "internal_notification",
      recipient: teamEmail,
      subject: `✅ ${client.companyName} — Onboarding Complete`,
      resendId: result.data?.id || null,
      status: result.error ? "failed" : "sent",
    },
  })

  return result
}

/**
 * Send invite email to a new admin user
 */
export async function sendUserInviteEmail(userId: string, token: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  })

  const link = `${APP_URL}/setup/${token}`

  const html = baseTemplate(`
    <h1>You&apos;re Invited to ${APP_NAME}</h1>
    <p>Hi ${user.name},</p>
    <p>You&apos;ve been invited to join the <strong>${APP_NAME}</strong> onboarding platform as a team member. Click below to set your password and activate your account.</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${link}" class="btn">Set Your Password &rarr;</a>
    </p>
    <p style="color: #9CA3AF; font-size: 13px;">This link will expire in 30 days. If you didn&apos;t expect this invite, you can safely ignore this email.</p>
  `)

  const result = await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `${APP_NAME} — You're Invited`,
    html,
  })

  return result
}

/**
 * Notify internal team when a client sends a message from the form
 */
export async function sendClientMessageNotification(clientId: string, messageId: string, teamEmail: string) {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    include: { submission: true },
  })

  const message = await prisma.message.findUniqueOrThrow({
    where: { id: messageId },
  })

  const stepLabels: Record<number, string> = {
    1: "Company Profile",
    2: "Services & Differentiators",
    3: "SWOT Analysis",
    4: "Team & Contacts",
    5: "Current Marketing",
    6: "Platform Access",
    7: "Goals & Priorities",
  }

  const stepName = message.formStep ? stepLabels[message.formStep] || `Step ${message.formStep}` : "Unknown"
  const completedSteps = (client.submission?.completedSteps as number[]) || []
  const progress = Math.round((completedSteps.length / 7) * 100)
  const adminLink = `${APP_URL}/admin/clients/${clientId}`
  const sentAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(message.createdAt)

  const html = baseTemplate(`
    <h1>&#128172; New Message from Client</h1>
    <div class="highlight-box">
      <p><strong>From:</strong> ${message.senderName} (${message.senderEmail})</p>
      <p><strong>Company:</strong> ${client.companyName}</p>
      <p><strong>Form Section:</strong> ${stepName}</p>
      <p><strong>Progress:</strong> ${progress}% complete (${completedSteps.length}/7 sections)</p>
      <p><strong>Sent:</strong> ${sentAt} CST</p>
    </div>
    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #1B3A5C; margin: 0; white-space: pre-wrap;">${message.content}</p>
    </div>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${adminLink}" class="btn">View Client Details &rarr;</a>
    </p>
  `)

  const result = await resend.emails.send({
    from: FROM,
    to: teamEmail,
    subject: `💬 ${client.companyName} — New Message from ${message.senderName}`,
    html,
  })

  await prisma.emailLog.create({
    data: {
      clientId,
      type: "internal_notification",
      recipient: teamEmail,
      subject: `💬 ${client.companyName} — New Message from ${message.senderName}`,
      resendId: result.data?.id || null,
      status: result.error ? "failed" : "sent",
    },
  })

  return result
}
