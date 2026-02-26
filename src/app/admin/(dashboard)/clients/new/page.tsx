"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, UserPlus } from "lucide-react"
import Link from "next/link"

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sendInvite, setSendInvite] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    industry: "",
    websiteUrl: "",
  })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Create client
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create client")
      }

      const client = await res.json()

      // Send invite email if checked
      if (sendInvite) {
        await fetch(`/api/clients/${client.id}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reminder: false }),
        })
      }

      router.push(`/admin/clients/${client.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-500 font-display">New Client</h1>
          <p className="text-surface-500 mt-0.5 text-sm">Add a new client and send their onboarding invite.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-navy-600 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-500" />
              Client Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Company Name"
                  placeholder="e.g., Gallegos Equipment LLC"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  required
                />
              </div>
              <Input
                label="Contact Name"
                placeholder="Full name"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                required
              />
              <Input
                label="Contact Email"
                type="email"
                placeholder="name@company.com"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 555-5555"
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
              />
              <Input
                label="Industry"
                placeholder="e.g., Heavy Equipment, Oil & Gas"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Website URL"
                  type="url"
                  placeholder="https://www.company.com"
                  value={form.websiteUrl}
                  onChange={(e) => update("websiteUrl", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendInvite}
                onChange={(e) => setSendInvite(e.target.checked)}
                className="rounded border-surface-300 text-brand-500 focus:ring-brand-500"
              />
              Send invite email immediately
            </label>

            <div className="flex items-center gap-3">
              {error && (
                <span className="text-sm text-error">{error}</span>
              )}
              <Button type="submit" loading={loading}>
                <Send className="w-4 h-4" />
                {sendInvite ? "Create & Send Invite" : "Create Client"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
