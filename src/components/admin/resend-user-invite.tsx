"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function ResendUserInvite({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      await fetch(`/api/users/${userId}/resend`, { method: "POST" })
      setSent(true)
      router.refresh()
      setTimeout(() => setSent(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return <span className="text-xs text-emerald-500 font-medium">Sent!</span>
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleResend} loading={loading}>
      <RefreshCw className="w-3.5 h-3.5" />
      Resend
    </Button>
  )
}
