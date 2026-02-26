"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { StepProgress } from "@/components/onboard/step-progress"
import { Step1Company } from "@/components/onboard/steps/step-1-company"
import { Step2Services } from "@/components/onboard/steps/step-2-services"
import { Step3Swot } from "@/components/onboard/steps/step-3-swot"
import { Step4Contacts } from "@/components/onboard/steps/step-4-contacts"
import { Step5Marketing } from "@/components/onboard/steps/step-5-marketing"
import { Step6Platforms } from "@/components/onboard/steps/step-6-platforms"
import { Step7Goals } from "@/components/onboard/steps/step-7-goals"
import { MessagePanel } from "@/components/onboard/message-panel"
import { ChevronLeft, ChevronRight, Send, Save, MessageCircle } from "lucide-react"

const TOTAL_STEPS = 7
const AUTO_SAVE_DELAY = 3000

export default function OnboardPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [contactName, setContactName] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [dirty, setDirty] = useState(false)
  const [messagePanelOpen, setMessagePanelOpen] = useState(false)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Load form state
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/onboard/${token}`)
        if (res.status === 410) {
          router.replace(`/onboard/${token}/complete`)
          return
        }
        if (!res.ok) {
          setError("This link is invalid or has expired. Please contact your ResultReach team.")
          setLoading(false)
          return
        }
        const data = await res.json()
        setCompanyName(data.companyName)
        setContactName(data.contactName)
        if (data.submission) {
          setCurrentStep(data.submission.currentStep || 1)
          setCompletedSteps(data.submission.completedSteps || [])
          // Spread submission fields into formData
          const fields = { ...data.submission }
          delete fields.id
          delete fields.clientId
          delete fields.currentStep
          delete fields.completedSteps
          delete fields.submittedAt
          delete fields.lastSavedAt
          delete fields.createdAt
          delete fields.updatedAt
          setFormData(fields)
        }
        setLoading(false)
      } catch {
        setError("Failed to load. Please try again later.")
        setLoading(false)
      }
    }
    load()
  }, [token, router])

  // Auto-save when dirty
  useEffect(() => {
    if (!dirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveProgress(false)
    }, AUTO_SAVE_DELAY)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, dirty])

  const handleChange = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
  }, [])

  const saveProgress = async (markComplete: boolean) => {
    setSaving(true)
    try {
      const stepFields = getStepFields(currentStep)
      const data: Record<string, unknown> = {}
      stepFields.forEach((f) => {
        if (formData[f] !== undefined) data[f] = formData[f]
      })

      await fetch(`/api/onboard/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: currentStep, data, markComplete }),
      })

      if (markComplete && !completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep].sort())
      }
      setDirty(false)
    } catch {
      // Silent fail for auto-save; could add toast
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    await saveProgress(true)
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    await saveProgress(true)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/onboard/${token}`, { method: "POST" })
      if (res.ok) {
        router.push(`/onboard/${token}/complete`)
      }
    } catch {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center space-y-4 animate-fade-in">
          <Logo size="lg" />
          <div className="h-1 w-32 mx-auto bg-surface-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-brand-500 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-surface-400">Loading your onboarding...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="max-w-md text-center space-y-6 animate-fade-in">
          <Logo size="lg" className="justify-center" />
          <div className="rounded-xl bg-surface-0 shadow-card border border-surface-100 p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-navy-500 font-display">Link Unavailable</h1>
            <p className="mt-2 text-sm text-surface-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    const props = { data: formData, onChange: handleChange }
    switch (currentStep) {
      case 1: return <Step1Company {...props} />
      case 2: return <Step2Services {...props} />
      case 3: return <Step3Swot {...props} />
      case 4: return <Step4Contacts {...props} />
      case 5: return <Step5Marketing {...props} />
      case 6: return <Step6Platforms {...props} />
      case 7: return <Step7Goals {...props} />
      default: return null
    }
  }

  const isLastStep = currentStep === TOTAL_STEPS
  const allComplete = completedSteps.length >= TOTAL_STEPS - 1 // Allow submit if 6/7 done (current might be 7th)

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface-0/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-surface-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                Saving...
              </span>
            )}
            {!saving && dirty && (
              <span className="text-xs text-surface-300">Unsaved changes</span>
            )}
            {!saving && !dirty && (
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={() => setMessagePanelOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 active:scale-[0.97] transition-all duration-150 border border-brand-200/60"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Need Help?
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-500 font-display">
            Welcome, {contactName}
          </h1>
          <p className="text-surface-500 mt-1">
            Let&apos;s build the foundation for <strong className="text-navy-600">{companyName}</strong>&apos;s marketing strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar - Step Progress */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <StepProgress
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={(step) => {
                  saveProgress(false)
                  setCurrentStep(step)
                }}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {/* Mobile step indicator */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-navy-600">Step {currentStep} of {TOTAL_STEPS}</span>
                <span className="text-surface-400">{Math.round((completedSteps.length / TOTAL_STEPS) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps.length / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-surface-0 shadow-card border border-surface-100 p-6 sm:p-8 animate-fade-in">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => saveProgress(false)}
                  disabled={saving || !dirty}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>

                {isLastStep ? (
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!allComplete && completedSteps.length < TOTAL_STEPS - 1}
                  >
                    <Send className="w-4 h-4" />
                    Submit Onboarding
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating message panel */}
      <MessagePanel
        token={token}
        currentStep={currentStep}
        contactName={contactName}
        open={messagePanelOpen}
        onOpenChange={setMessagePanelOpen}
      />
    </div>
  )
}

// Map steps to their DB fields for partial saves
function getStepFields(step: number): string[] {
  switch (step) {
    case 1: return ["companyLegalName", "targetTerritory", "industries"]
    case 2: return ["services", "specializedServices"]
    case 3: return ["strengths", "weaknesses", "opportunities", "threats"]
    case 4: return ["marketingContact", "salesContact", "operationsContact", "decisionMaker", "preferredComm"]
    case 5: return ["activeChannels", "monthlyBudget", "bestPerforming", "crmSystem", "erpSystem", "crmMaturity"]
    case 6: return ["platformAccess"]
    case 7: return ["sixMonthGoals", "websiteChanges", "additionalNotes"]
    default: return []
  }
}
