import { Logo } from "@/components/shared/logo"
import { CheckCircle2 } from "lucide-react"

export default function CompletePage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8 animate-slide-up">
        <Logo size="lg" className="justify-center" />

        <div className="rounded-2xl bg-surface-0 shadow-lg border border-surface-100 p-10">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>

          <h1 className="text-2xl font-bold text-navy-500 font-display">
            You&apos;re All Set!
          </h1>

          <p className="mt-3 text-surface-500 leading-relaxed">
            Thank you for completing your onboarding questionnaire. Our team has been notified and will review your responses shortly.
          </p>

          <div className="mt-6 rounded-xl bg-brand-50 border border-brand-100 p-5">
            <h3 className="text-sm font-semibold text-brand-700">What happens next?</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-600 text-left">
              <li className="flex gap-2">
                <span className="text-gold-500 font-bold shrink-0">1.</span>
                We&apos;ll review your responses and do our homework
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500 font-bold shrink-0">2.</span>
                Your account manager will reach out to schedule a kickoff call
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500 font-bold shrink-0">3.</span>
                We&apos;ll present a tailored strategy built around your goals
              </li>
            </ul>
          </div>

          <p className="mt-6 text-xs text-surface-400">
            Questions? Email us at{" "}
            <a href="mailto:team@resultreach.com" className="text-brand-500 hover:underline font-medium">
              team@resultreach.com
            </a>
          </p>
        </div>

        <p className="text-xs text-surface-300">
          © {new Date().getFullYear()} ResultReach. All rights reserved.
        </p>
      </div>
    </div>
  )
}
