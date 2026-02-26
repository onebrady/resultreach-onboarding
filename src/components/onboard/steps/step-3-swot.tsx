"use client"

import { Textarea } from "@/components/ui/textarea"

interface Step3Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

export function Step3Swot({ data, onChange }: Step3Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">SWOT Analysis</h2>
        <p className="mt-1 text-sm text-surface-500">
          Understanding your strengths, weaknesses, opportunities, and threats helps us craft the right strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-navy-600">Strengths</span>
          </div>
          <Textarea
            placeholder="What sets you apart?&#10;&#10;Example: In business 25+ years, local knowledge, full service center, continuous improvement in engineering"
            value={(data.strengths as string) || ""}
            onChange={(e) => onChange("strengths", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-navy-600">Weaknesses</span>
          </div>
          <Textarea
            placeholder="Where do you struggle?&#10;&#10;Example: Social media presence, SEO for core products, price point not competitive for X equipment"
            value={(data.weaknesses as string) || ""}
            onChange={(e) => onChange("weaknesses", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="text-sm font-semibold text-navy-600">Opportunities</span>
          </div>
          <Textarea
            placeholder="What's the upside?&#10;&#10;Example: Prospect customers, niche markets (auction traffic, FEMA, federal/military contracts, procurement)"
            value={(data.opportunities as string) || ""}
            onChange={(e) => onChange("opportunities", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-navy-600">Threats</span>
          </div>
          <Textarea
            placeholder="Who or what are the biggest threats?&#10;&#10;Example: Top competitors — Polar, Ranco, Ratessa. New market entrants from international brands."
            value={(data.threats as string) || ""}
            onChange={(e) => onChange("threats", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
