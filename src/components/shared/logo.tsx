"use client"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "full" | "mark" | "text"
  className?: string
}

const sizes = {
  sm: { text: "text-lg", icon: 24 },
  md: { text: "text-2xl", icon: 32 },
  lg: { text: "text-4xl", icon: 48 },
}

export function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {variant !== "text" && (
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* Orbital ring */}
          <ellipse
            cx="24"
            cy="26"
            rx="20"
            ry="10"
            stroke="var(--color-navy-500)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="80 40"
          />
          <ellipse
            cx="24"
            cy="26"
            rx="20"
            ry="10"
            stroke="var(--color-gold-400)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="40 80"
            strokeDashoffset="80"
          />
          {/* Letter R */}
          <text
            x="16"
            y="32"
            fontFamily="var(--font-display)"
            fontWeight="700"
            fontSize="24"
            fill="var(--color-navy-500)"
          >
            R
          </text>
          {/* Arrow */}
          <path
            d="M30 20L36 12M36 12L33 16M36 12L32 13"
            stroke="var(--color-gold-400)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {variant !== "mark" && (
        <span className={`font-display font-bold tracking-tight ${s.text}`}>
          <span className="text-navy-500">Result</span>
          <span className="text-brand-500">Reach</span>
        </span>
      )}
    </div>
  )
}
