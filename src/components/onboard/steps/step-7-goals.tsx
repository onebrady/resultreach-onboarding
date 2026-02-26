"use client"

import { Textarea } from "@/components/ui/textarea"

interface Step7Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function Step7Goals({ data, onChange }: Step7Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">Goals & Priorities</h2>
        <p className="mt-1 text-sm text-surface-500">
          Last step — tell us where you want to go. This shapes everything we build for you.
        </p>
      </div>

      <div className="space-y-6">
        <Textarea
          label="6-Month Goals"
          placeholder="What are your immediate goals for the next 6 months?&#10;&#10;Example: Increase inbound leads by 30%, launch social media presence, rank on page 1 for 'heavy haul trucking Texas', generate 50+ qualified leads/month"
          value={(data.sixMonthGoals as string) || ""}
          onChange={(e) => onChange("sixMonthGoals", e.target.value)}
          hint="Be specific — numbers and timelines help us measure success"
        />

        <Textarea
          label="Website Changes"
          placeholder="Is there anything you would like to change or add to your website?&#10;&#10;Example: Need a complete redesign, add a parts catalog, improve mobile experience, add lead capture forms, integrate with our CRM"
          value={(data.websiteChanges as string) || ""}
          onChange={(e) => onChange("websiteChanges", e.target.value)}
        />

        <Textarea
          label="Additional Notes"
          placeholder="Anything else we should know? Special considerations, upcoming events, seasonal peaks, industry-specific details..."
          value={(data.additionalNotes as string) || ""}
          onChange={(e) => onChange("additionalNotes", e.target.value)}
          hint="No detail is too small — this helps us deliver from day one"
        />
      </div>
    </div>
  )
}
