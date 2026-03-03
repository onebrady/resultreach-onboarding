import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const dimensions = {
  sm: { width: 120, height: 32 },
  md: { width: 160, height: 42 },
  lg: { width: 220, height: 58 },
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const d = dimensions[size]

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/result-reach-logo.png"
        alt="ResultReach"
        width={d.width}
        height={d.height}
        priority
        className="object-contain"
      />
    </div>
  )
}
