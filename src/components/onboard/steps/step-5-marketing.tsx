"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Step5Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

const channels = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "Google Ads",
  "Google Business",
  "TikTok",
  "X (Twitter)",
  "Email Marketing",
  "Print / Direct Mail",
  "Trade Shows",
  "Radio / TV",
]

const budgetRanges = [
  "Under $1,000/mo",
  "$1,000 – $3,000/mo",
  "$3,000 – $5,000/mo",
  "$5,000 – $10,000/mo",
  "$10,000 – $25,000/mo",
  "$25,000+/mo",
  "Not sure",
]

const maturityLevels = [
  { value: "none", label: "Not using one", desc: "No CRM in place" },
  { value: "early", label: "Early Stage", desc: "Just getting started" },
  { value: "developing", label: "Developing", desc: "Using basics, room to grow" },
  { value: "mature", label: "Mature", desc: "Well-established processes" },
]

export function Step5Marketing({ data, onChange }: Step5Props) {
  const activeChannels = (data.activeChannels as string[]) || []

  const toggleChannel = (channel: string) => {
    const updated = activeChannels.includes(channel)
      ? activeChannels.filter((c) => c !== channel)
      : [...activeChannels, channel]
    onChange("activeChannels", updated)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">Current Marketing</h2>
        <p className="mt-1 text-sm text-surface-500">
          Help us understand where you are today so we can build on what&apos;s working.
        </p>
      </div>

      {/* Active Channels */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-navy-700">
          Active Marketing Channels
        </label>
        <p className="text-xs text-surface-400">Select all that you currently use</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {channels.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => toggleChannel(ch)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 text-left ${
                activeChannels.includes(ch)
                  ? "bg-brand-50 border-brand-300 text-brand-700"
                  : "bg-surface-0 border-surface-200 text-surface-600 hover:border-surface-300"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Budget */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-navy-700">
          Monthly Marketing Budget
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {budgetRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onChange("monthlyBudget", range)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 text-left ${
                data.monthlyBudget === range
                  ? "bg-gold-50 border-gold-300 text-gold-700"
                  : "bg-surface-0 border-surface-200 text-surface-600 hover:border-surface-300"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Best Performing Marketing"
        placeholder="What has been your most successful marketing so far?&#10;&#10;Example: Google Ads for parts searches, Facebook video ads, trade show presence at ConExpo"
        value={(data.bestPerforming as string) || ""}
        onChange={(e) => onChange("bestPerforming", e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label="CRM System"
          placeholder="e.g., Salesforce, HubSpot, GoHighLevel"
          value={(data.crmSystem as string) || ""}
          onChange={(e) => onChange("crmSystem", e.target.value)}
        />
        <Input
          label="ERP System"
          placeholder="e.g., SAP, Oracle, NetSuite"
          value={(data.erpSystem as string) || ""}
          onChange={(e) => onChange("erpSystem", e.target.value)}
        />
      </div>

      {/* CRM Maturity */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-navy-700">
          CRM Maturity Level
        </label>
        <div className="grid grid-cols-2 gap-2">
          {maturityLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange("crmMaturity", level.value)}
              className={`px-4 py-3 rounded-lg border text-left transition-all duration-150 ${
                data.crmMaturity === level.value
                  ? "bg-brand-50 border-brand-300"
                  : "bg-surface-0 border-surface-200 hover:border-surface-300"
              }`}
            >
              <span className={`text-sm font-medium ${
                data.crmMaturity === level.value ? "text-brand-700" : "text-navy-600"
              }`}>
                {level.label}
              </span>
              <span className="block text-xs text-surface-400 mt-0.5">{level.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
