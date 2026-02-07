'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { X, Send, CheckCircle, Loader2 } from 'lucide-react'
import { Service, SERVICE_ACTION_LABELS } from '@/lib/types/database'
import { Theme } from '@/lib/types/database'

interface ContactModalProps {
  service: Service
  theme: Theme
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ service, theme, isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/services/${service.id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_name: name, sender_email: email, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setSubmitted(true)
      setTimeout(() => { onClose(); setSubmitted(false); setName(''); setEmail(''); setMessage('') }, 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <m.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <m.div
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
              backdropFilter: 'blur(40px)',
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {submitted ? (
                <m.div
                  className="flex flex-col items-center py-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <m.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle className="w-16 h-16 mb-4" style={{ color: theme.primaryColor }} />
                  </m.div>
                  <h3 className="text-white text-lg font-semibold mb-1">Sent!</h3>
                  <p className="text-white/40 text-sm text-center">Your message has been delivered successfully.</p>
                </m.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-5">
                    <h3 className="text-white font-semibold text-lg">{SERVICE_ACTION_LABELS[service.action_type]}</h3>
                    <p className="text-white/40 text-sm mt-1">{service.title}</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                    />
                    <textarea
                      placeholder="Your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    />

                    {error && <p className="text-red-400 text-xs">{error}</p>}

                    <m.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
                      }}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </m.button>
                  </form>
                </>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
