"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send, Bell, CheckCircle2 } from "lucide-react"

export function ClientActions({ clientId, status }: { clientId: string; status: string }) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [reminding, setReminding] = useState(false)
  const [marking, setMarking] = useState(false)

  const sendInvite = async () => {
    setSending(true)
    await fetch(`/api/clients/${clientId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminder: false }),
    })
    setSending(false)
    router.refresh()
  }

  const sendReminder = async () => {
    setReminding(true)
    await fetch(`/api/clients/${clientId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminder: true }),
    })
    setReminding(false)
    router.refresh()
  }

  const markReviewed = async () => {
    setMarking(true)
    await fetch(`/api/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed" }),
    })
    setMarking(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {(status === "invited" || status === "in_progress") && (
        <>
          <Button variant="secondary" size="sm" onClick={sendInvite} loading={sending}>
            <Send className="w-3.5 h-3.5" />
            {status === "invited" ? "Resend Invite" : "Send Invite"}
          </Button>
          <Button variant="secondary" size="sm" onClick={sendReminder} loading={reminding}>
            <Bell className="w-3.5 h-3.5" />
            Send Reminder
          </Button>
        </>
      )}
      {status === "submitted" && (
        <Button variant="gold" size="sm" onClick={markReviewed} loading={marking}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark Reviewed
        </Button>
      )}
    </div>
  )
}
