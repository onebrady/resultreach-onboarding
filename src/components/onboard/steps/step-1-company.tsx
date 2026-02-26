"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Step1Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function Step1Company({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">Company Profile</h2>
        <p className="mt-1 text-sm text-surface-500">
          Tell us about your business so we can tailor our strategy to your market.
        </p>
      </div>

      <div className="space-y-6">
        <Input
          label="Company Legal Name"
          placeholder="e.g., Gallegos Equipment LLC"
          value={(data.companyLegalName as string) || ""}
          onChange={(e) => onChange("companyLegalName", e.target.value)}
          hint="Your registered business name"
        />

        <Textarea
          label="Target Territory"
          placeholder="What zip codes, cities, and regions do you cover?&#10;&#10;Example: Texas Oil patch and supporting dealers — Oil and Gas Products. Zip codes 75001-75999."
          value={(data.targetTerritory as string) || ""}
          onChange={(e) => onChange("targetTerritory", e.target.value)}
          hint="Be as specific as possible — include zip codes, cities, states, or regions"
        />

        <Textarea
          label="Industries Served"
          placeholder="What industries do your customers operate in?&#10;&#10;Example: Oil & Gas, Heavy Equipment, Transportation, Municipal, Agricultural"
          value={(data.industries as string) || ""}
          onChange={(e) => onChange("industries", e.target.value)}
          hint="List all industries you serve or want to target"
        />
      </div>
    </div>
  )
}
