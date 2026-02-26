"use client"

import { Input } from "@/components/ui/input"

interface ContactFields {
  name?: string
  phone?: string
  email?: string
  role?: string
}

interface Step4Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

function ContactBlock({
  title,
  description,
  value,
  onChange,
  showRole,
}: {
  title: string
  description: string
  value: ContactFields
  onChange: (v: ContactFields) => void
  showRole?: boolean
}) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-navy-600">{title}</h3>
        <p className="text-xs text-surface-400 mt-0.5">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          placeholder="Full name"
          value={value.name || ""}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <Input
          label="Phone"
          placeholder="(555) 555-5555"
          type="tel"
          value={value.phone || ""}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
        <Input
          label="Email"
          placeholder="name@company.com"
          type="email"
          value={value.email || ""}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
        />
        {showRole && (
          <Input
            label="Title / Role"
            placeholder="e.g., VP of Marketing"
            value={value.role || ""}
            onChange={(e) => onChange({ ...value, role: e.target.value })}
          />
        )}
      </div>
    </div>
  )
}

const commOptions = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "text", label: "Text / SMS" },
  { value: "slack", label: "Slack" },
  { value: "teams", label: "Microsoft Teams" },
]

export function Step4Contacts({ data, onChange }: Step4Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">Team & Contacts</h2>
        <p className="mt-1 text-sm text-surface-500">
          Who should we work with? We need contacts for marketing, sales, and operations.
        </p>
      </div>

      <div className="space-y-4">
        <ContactBlock
          title="Decision Maker"
          description="Primary person who approves strategy and budget"
          value={(data.decisionMaker as ContactFields) || {}}
          onChange={(v) => onChange("decisionMaker", v)}
          showRole
        />

        <ContactBlock
          title="Marketing Contact"
          description="Day-to-day marketing point person"
          value={(data.marketingContact as ContactFields) || {}}
          onChange={(v) => onChange("marketingContact", v)}
        />

        <ContactBlock
          title="Sales Contact"
          description="Understands leads, pipeline, and revenue goals"
          value={(data.salesContact as ContactFields) || {}}
          onChange={(v) => onChange("salesContact", v)}
        />

        <ContactBlock
          title="Operations Contact"
          description="Handles logistics, fulfillment, or technical details"
          value={(data.operationsContact as ContactFields) || {}}
          onChange={(v) => onChange("operationsContact", v)}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-navy-700">
          Preferred Communication Method
        </label>
        <div className="flex flex-wrap gap-2">
          {commOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange("preferredComm", opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                data.preferredComm === opt.value
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "bg-surface-0 border-surface-200 text-surface-600 hover:border-surface-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
