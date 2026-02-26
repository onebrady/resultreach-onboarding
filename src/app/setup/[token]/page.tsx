"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Logo } from "@/components/shared/logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle2 } from "lucide-react"

export default function SetupPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/setup/${token}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Invalid invite link")
          setLoading(false)
          return
        }
        const data = await res.json()
        setName(data.name)
        setEmail(data.email)
        setLoading(false)
      } catch {
        setError("Failed to validate invite")
        setLoading(false)
      }
    }
    validate()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/setup/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to set password")
      }

      setDone(true)
      setTimeout(() => router.push("/admin/login"), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center space-y-4 animate-fade-in">
          <Logo size="lg" />
          <p className="text-sm text-surface-400">Validating invite...</p>
        </div>
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="max-w-sm text-center space-y-6 animate-fade-in">
          <Logo size="lg" className="justify-center" />
          <div className="rounded-xl bg-surface-0 shadow-card border border-surface-100 p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-error" />
            </div>
            <h1 className="text-lg font-bold text-navy-500 font-display">Invite Unavailable</h1>
            <p className="mt-2 text-sm text-surface-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
        <div className="max-w-sm text-center space-y-6 animate-scale-in">
          <Logo size="lg" className="justify-center" />
          <div className="rounded-xl bg-surface-0 shadow-card border border-surface-100 p-8">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-lg font-bold text-navy-500 font-display">Account Activated!</h1>
            <p className="mt-2 text-sm text-surface-500">
              Redirecting you to sign in...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <Logo size="lg" className="justify-center" />
          <p className="mt-3 text-sm text-surface-400">Set up your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-surface-0 shadow-card border border-surface-100 p-8 space-y-5"
        >
          <div className="text-center pb-4 border-b border-surface-100">
            <p className="text-sm font-medium text-navy-600">Welcome, {name}</p>
            <p className="text-xs text-surface-400 mt-0.5">{email}</p>
          </div>

          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            <Lock className="w-4 h-4" />
            Activate Account
          </Button>
        </form>
      </div>
    </div>
  )
}
