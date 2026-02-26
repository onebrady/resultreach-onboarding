"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send, X, CheckCircle2 } from "lucide-react"

interface MessagePanelProps {
  token: string
  currentStep: number
  contactName: string
}

export function MessagePanel({ token, currentStep, contactName }: MessagePanelProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)

    try {
      const res = await fetch(`/api/onboard/${token}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, formStep: currentStep }),
      })

      if (res.ok) {
        setSent(true)
        setMessage("")
        setTimeout(() => {
          setSent(false)
          setOpen(false)
        }, 3000)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg hover:shadow-xl hover:bg-brand-600 active:scale-95 transition-all duration-200 flex items-center justify-center group"
          aria-label="Send a message to the ResultReach team"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Message panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] animate-scale-in">
          <div className="rounded-2xl bg-surface-0 shadow-xl border border-surface-100 overflow-hidden">
            {/* Header */}
            <div className="bg-navy-500 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm font-display">
                  Send Us a Message
                </h3>
                <p className="text-navy-200 text-xs mt-0.5">
                  We&apos;ll get back to you as soon as possible
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-navy-300 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {sent ? (
                <div className="py-8 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-navy-600">Message Sent!</p>
                  <p className="text-xs text-surface-400 mt-1">Our team will review it shortly.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-surface-400 mb-3">
                    Hi {contactName} — have a question or need help with the form? Let us know.
                  </p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="block w-full rounded-lg border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      onClick={handleSend}
                      loading={sending}
                      disabled={!message.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Message
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
