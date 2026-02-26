"use client"

import { Textarea } from "@/components/ui/textarea"

interface Step2Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function Step2Services({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">Services & Differentiators</h2>
        <p className="mt-1 text-sm text-surface-500">
          What do you offer, and what makes you stand out from the competition?
        </p>
      </div>

      <div className="space-y-6">
        <Textarea
          label="Services Offered"
          placeholder="Please list out the services that you provide.&#10;&#10;Example: Heavy and medium duty trucks, pre-owned trucks, parts for all makes/models, service, fleet/mobile service, DPF cleaning, flywheel grinding, truck financing"
          value={(data.services as string) || ""}
          onChange={(e) => onChange("services", e.target.value)}
          hint="List all products and services — be thorough"
        />

        <Textarea
          label="Specialized Services"
          placeholder="What separates you from other OEMs or local competing brands?&#10;&#10;Example: Only authorized dealer in the region for X brand, proprietary upfitting process, 24/7 emergency mobile service"
          value={(data.specializedServices as string) || ""}
          onChange={(e) => onChange("specializedServices", e.target.value)}
          hint="What's your unique selling proposition? What can customers only get from you?"
        />
      </div>
    </div>
  )
}
