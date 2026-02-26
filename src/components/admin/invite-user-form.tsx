"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle2 } from "lucide-react"

export function InviteUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", role: "admin" })

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to invite user")
      }

      setSuccess(true)
      setForm({ name: "", email: "", role: "admin" })
      router.refresh()
      setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <Input
            label="Name"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            label="Email"
            type="email"
            placeholder="name@resultreach.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="block w-full rounded-lg border border-surface-200 bg-surface-0 px-3 py-2.5 text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <Button type="submit" loading={loading}>
          <Send className="w-4 h-4" />
          Send Invite
        </Button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="text-sm text-emerald-700">Invite sent! They&apos;ll receive an email with a link to set their password.</p>
        </div>
      )}
    </form>
  )
}
