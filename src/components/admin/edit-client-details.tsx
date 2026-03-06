"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Building2, User, Mail, Phone, Globe, Calendar,
  Pencil, X, Check, Loader2,
} from "lucide-react"

interface ClientDetails {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  industry: string | null
  websiteUrl: string | null
  createdAt: string
  assignedTo: { name: string } | null
}

export function EditClientDetails({ client }: { client: ClientDetails }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    companyName: client.companyName,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone || "",
    industry: client.industry || "",
    websiteUrl: client.websiteUrl || "",
  })

  const handleCancel = () => {
    setForm({
      companyName: client.companyName,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone || "",
      industry: client.industry || "",
      websiteUrl: client.websiteUrl || "",
    })
    setError(null)
    setEditing(false)
  }

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
      setError("Company name, contact name, and email are required.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactName: form.contactName.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim() || null,
          industry: form.industry.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Update failed")
      }

      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy-600">Client Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Company" value={client.companyName} />
          <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Contact" value={client.contactName} />
          <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={client.contactEmail} />
          {client.contactPhone && (
            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={client.contactPhone} />
          )}
          {client.websiteUrl && (
            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={client.websiteUrl} link />
          )}
          {client.industry && (
            <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Industry" value={client.industry} />
          )}
          <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Created" value={formatDate(client.createdAt)} />
          {client.assignedTo && (
            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Assigned" value={client.assignedTo.name} />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="ring-2 ring-brand-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-navy-600">Edit Client Details</h3>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        <EditField
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Company"
          value={form.companyName}
          onChange={(v) => setForm({ ...form, companyName: v })}
          required
        />
        <EditField
          icon={<User className="w-3.5 h-3.5" />}
          label="Contact"
          value={form.contactName}
          onChange={(v) => setForm({ ...form, contactName: v })}
          required
        />
        <EditField
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          value={form.contactEmail}
          onChange={(v) => setForm({ ...form, contactEmail: v })}
          type="email"
          required
        />
        <EditField
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone"
          value={form.contactPhone}
          onChange={(v) => setForm({ ...form, contactPhone: v })}
          type="tel"
        />
        <EditField
          icon={<Globe className="w-3.5 h-3.5" />}
          label="Website"
          value={form.websiteUrl}
          onChange={(v) => setForm({ ...form, websiteUrl: v })}
          type="url"
        />
        <EditField
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Industry"
          value={form.industry}
          onChange={(v) => setForm({ ...form, industry: v })}
        />

        {/* Read-only fields */}
        <div className="border-t border-surface-100 pt-3 mt-3">
          <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Created" value={formatDate(client.createdAt)} />
          {client.assignedTo && (
            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Assigned" value={client.assignedTo.name} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-surface-400 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-surface-400 block">{label}</span>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline truncate block">{value}</a>
        ) : (
          <span className="text-sm text-navy-700 block truncate">{value}</span>
        )}
      </div>
    </div>
  )
}

function EditField({ icon, label, value, onChange, type = "text", required }: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-surface-400 mt-2.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] uppercase tracking-wider text-surface-400 block mb-1">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </div>
  )
}
