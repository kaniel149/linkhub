'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { X, CheckCircle, Loader2, CreditCard, ExternalLink } from 'lucide-react'
import { Service, formatPrice } from '@/lib/types/database'
import { Theme } from '@/lib/types/database'

interface PaymentModalProps {
  service: Service
  theme: Theme
  isOpen: boolean
  onClose: () => void
  username: string
}

export function PaymentModal({ service, theme, isOpen, onClose, username }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirected, setRedirected] = useState(false)

  const priceDisplay = formatPrice(service.pricing, service.price_amount, service.price_currency)

  const handlePay = async () => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          service_id: service.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create payment link')

      if (data.payment_url) {
        setRedirected(true)
        window.open(data.payment_url, '_blank')
        setTimeout(() => {
          onClose()
          setRedirected(false)
        }, 2000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
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
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
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
              {redirected ? (
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
                  <h3 className="text-white text-lg font-semibold mb-1">Redirecting...</h3>
                  <p className="text-white/40 text-sm text-center">
                    You&apos;re being redirected to complete the payment.
                  </p>
                </m.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-white/40" />
                      <h3 className="text-white font-semibold text-lg">Purchase</h3>
                    </div>
                  </div>

                  {/* Service info */}
                  <div className="mb-5 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <h4 className="text-white/90 font-semibold text-sm mb-1">{service.title}</h4>
                    {service.description && (
                      <p className="text-white/40 text-xs leading-relaxed mb-3">{service.description}</p>
                    )}
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        color: theme.primaryColor,
                        background: `${theme.primaryColor}15`,
                        border: `1px solid ${theme.primaryColor}25`,
                      }}
                    >
                      {priceDisplay}
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                  {/* Pay button */}
                  <m.button
                    onClick={handlePay}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
                    }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Pay Now
                      </>
                    )}
                  </m.button>

                  <p className="text-white/20 text-[10px] text-center mt-3">
                    You&apos;ll be redirected to a secure payment page
                  </p>
                </>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
