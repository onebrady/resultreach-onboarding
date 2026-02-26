"use client"

import { ExternalLink } from "lucide-react"

interface Step6Props {
  data: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
}

const platforms = [
  {
    key: "facebook",
    name: "Facebook",
    icon: "📘",
    instructions: [
      "Go to Facebook Business Manager",
      "Navigate to Business Settings → People",
      "Click 'Add' and enter our team email",
      "Assign 'Admin' access",
    ],
    helpUrl: "https://business.facebook.com/settings/people",
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: "📸",
    instructions: [
      "Ensure your Instagram is a Business account",
      "Connect it to your Facebook Page in Meta Business Suite",
      "Our Facebook Admin access will carry over",
    ],
    helpUrl: "https://help.instagram.com/502981923235522",
  },
  {
    key: "google_business",
    name: "Google Business Profile",
    icon: "📍",
    instructions: [
      "Go to your Google Business Profile dashboard",
      "Click 'Users' in the left menu",
      "Add our team email as a 'Manager'",
    ],
    helpUrl: "https://business.google.com",
  },
  {
    key: "google_analytics",
    name: "Google Analytics",
    icon: "📊",
    instructions: [
      "Go to Google Analytics → Admin",
      "Under Account Access Management, click '+' → Add Users",
      "Enter our team email with 'Editor' access",
    ],
    helpUrl: "https://analytics.google.com",
  },
  {
    key: "google_ads",
    name: "Google Ads",
    icon: "🎯",
    instructions: [
      "Go to Google Ads → Tools → Access and Security",
      "Click '+' to invite a new user",
      "Enter our team email with 'Standard' or 'Admin' access",
    ],
    helpUrl: "https://ads.google.com",
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: "▶️",
    instructions: [
      "Go to YouTube Studio → Settings → Permissions",
      "Click 'Invite' and enter our team email",
      "Assign 'Manager' role",
    ],
    helpUrl: "https://studio.youtube.com",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    instructions: [
      "Go to your LinkedIn Company Page",
      "Click 'Admin tools' → Manage admins",
      "Add our team member as a 'Super admin' or 'Content admin'",
    ],
    helpUrl: "https://www.linkedin.com/company",
  },
]

const statusOptions = [
  { value: "not_applicable", label: "N/A", color: "bg-surface-100 text-surface-500" },
  { value: "pending", label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "granted", label: "Granted", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "need_help", label: "Need Help", color: "bg-brand-50 text-brand-700 border-brand-200" },
]

export function Step6Platforms({ data, onChange }: Step6Props) {
  const access = (data.platformAccess as Record<string, string>) || {}

  const updateAccess = (key: string, status: string) => {
    onChange("platformAccess", { ...access, [key]: status })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-navy-500 font-display">Platform Access</h2>
        <p className="mt-1 text-sm text-surface-500">
          We need access to your marketing platforms to manage campaigns. Follow the instructions below for each — <strong className="text-navy-600">no passwords needed</strong>.
        </p>
        <div className="mt-3 rounded-lg bg-gold-50 border border-gold-200 px-4 py-3">
          <p className="text-sm text-gold-800">
            <strong>Team email for access:</strong>{" "}
            <span className="font-mono text-gold-900">team@resultreach.com</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className="rounded-xl border border-surface-200 bg-surface-0 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{platform.icon}</span>
                <span className="font-semibold text-navy-700 text-sm">{platform.name}</span>
              </div>
              <div className="flex gap-1.5">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateAccess(platform.key, opt.value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150 ${
                      access[platform.key] === opt.value
                        ? opt.color + " border-current"
                        : "bg-surface-50 text-surface-400 border-transparent hover:bg-surface-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(access[platform.key] === "pending" || access[platform.key] === "need_help") && (
              <div className="px-4 pb-4 border-t border-surface-100 pt-3">
                <p className="text-xs font-medium text-surface-500 mb-2">How to grant access:</p>
                <ol className="space-y-1">
                  {platform.instructions.map((step, i) => (
                    <li key={i} className="text-xs text-surface-600 flex gap-2">
                      <span className="text-brand-500 font-semibold shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <a
                  href={platform.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-brand-500 hover:text-brand-600 font-medium"
                >
                  Open platform <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
