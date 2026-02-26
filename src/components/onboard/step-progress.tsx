"use client"

import { cn } from "@/lib/utils"
import {
  Building2,
  Briefcase,
  Target,
  Users,
  BarChart3,
  Share2,
  Flag,
} from "lucide-react"

const steps = [
  { num: 1, label: "Company Profile", icon: Building2 },
  { num: 2, label: "Services", icon: Briefcase },
  { num: 3, label: "SWOT Analysis", icon: Target },
  { num: 4, label: "Team & Contacts", icon: Users },
  { num: 5, label: "Marketing", icon: BarChart3 },
  { num: 6, label: "Platform Access", icon: Share2 },
  { num: 7, label: "Goals", icon: Flag },
]

interface StepProgressProps {
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

export function StepProgress({ currentStep, completedSteps, onStepClick }: StepProgressProps) {
  const progress = Math.round((completedSteps.length / steps.length) * 100)

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-navy-600">
          {completedSteps.length} of {steps.length} complete
        </span>
        <span className="text-surface-400 font-medium">{progress}%</span>
      </div>
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step list */}
      <nav className="space-y-1 mt-6">
        {steps.map((step) => {
          const isComplete = completedSteps.includes(step.num)
          const isCurrent = currentStep === step.num
          const Icon = step.icon

          return (
            <button
              key={step.num}
              onClick={() => onStepClick(step.num)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                "hover:bg-surface-50",
                isCurrent && "bg-brand-50 text-brand-700 font-medium",
                !isCurrent && isComplete && "text-navy-600",
                !isCurrent && !isComplete && "text-surface-400"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-all duration-150",
                  isCurrent && "bg-brand-500 text-white shadow-sm",
                  !isCurrent && isComplete && "bg-emerald-100 text-emerald-600",
                  !isCurrent && !isComplete && "bg-surface-100 text-surface-400"
                )}
              >
                {isComplete && !isCurrent ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="truncate">{step.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
