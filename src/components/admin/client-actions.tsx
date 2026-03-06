"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send, Bell, CheckCircle2, Trash2 } from "lucide-react"

export function ClientActions({ clientId, status, companyName }: {
  clientId: string
  status: string
  companyName: string
}) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [reminding, setReminding] = useState(false)
  const [marking, setMarking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/admin/clients")
      router.refresh()
    } else {
      setDeleting(false)
      setConfirmDelete(false)
      alert("Failed to delete client. Please try again.")
    }
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

      {/* Delete with confirmation */}
      {!confirmDelete ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          className="text-surface-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      ) : (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
          <span className="text-xs text-red-600 font-medium">Delete {companyName}?</span>
          <Button
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="bg-red-500 hover:bg-red-600 text-white h-7 px-2.5 text-xs"
          >
            Yes, delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
            className="h-7 px-2 text-xs"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
