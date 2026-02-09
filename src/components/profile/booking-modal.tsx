'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { X, CheckCircle, Loader2, Calendar, Clock, ArrowLeft, Video } from 'lucide-react'
import { Service } from '@/lib/types/database'
import { Theme } from '@/lib/types/database'

interface BookingModalProps {
  service: Service
  theme: Theme
  isOpen: boolean
  onClose: () => void
  username: string
}

interface TimeSlot {
  time: string
  available: boolean
}

function getNext14Days(): Date[] {
  const days: Date[] = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function BookingModal({ service, theme, isOpen, onClose, username }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [meetLink, setMeetLink] = useState<string | null>(null)

  if (!service) return null

  const days = getNext14Days()

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setError('')
    setLoading(true)

    try {
      const dateStr = formatDateISO(date)
      const res = await fetch(
        `/api/calendar/availability?username=${encodeURIComponent(username)}&date=${dateStr}&duration=30`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load availability')
      setAvailableSlots(data.slots || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not load time slots'
      setError(msg)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          date: formatDateISO(selectedDate),
          time: selectedSlot,
          duration: 30,
          name,
          email,
          message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to book')
      setSubmitted(true)
      if (data.meet_link) setMeetLink(data.meet_link)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setSelectedDate(null)
        setSelectedSlot(null)
        setName('')
        setEmail('')
        setMessage('')
        setMeetLink(null)
      }, 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (selectedSlot) {
      setSelectedSlot(null)
    } else if (selectedDate) {
      setSelectedDate(null)
      setAvailableSlots([])
    }
  }

  const step = !selectedDate ? 1 : !selectedSlot ? 2 : 3

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
            className="absolute inset-0 bg-black/80 backdrop-blur-[20px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <m.div
            className="relative w-full max-w-md rounded-[20px] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle className="w-12 h-12 mb-4" style={{ color: theme.primaryColor }} />
                  <h3 className="text-[#F5F5F7] text-lg font-semibold mb-1">Booked!</h3>
                  <p className="text-[#86868B] text-sm text-center">
                    Your meeting has been scheduled successfully.
                  </p>
                  {meetLink && (
                    <a
                      href={meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors"
                      style={{ color: theme.primaryColor, background: `${theme.primaryColor}15` }}
                    >
                      <Video className="w-4 h-4" />
                      Join Google Meet
                    </a>
                  )}
                </m.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      {step > 1 && (
                        <button
                          onClick={handleBack}
                          className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}
                      <Calendar className="w-5 h-5 text-[#86868B]" />
                      <h3 className="text-[#F5F5F7] font-semibold text-lg">Book Meeting</h3>
                    </div>
                    <p className="text-[#86868B] text-sm mt-1">{service.title}</p>
                  </div>

                  {/* Step indicators */}
                  <div className="flex items-center gap-2 mb-5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: s <= step ? theme.primaryColor : 'rgba(255,255,255,0.08)',
                          opacity: s <= step ? 1 : 0.5,
                        }}
                      />
                    ))}
                  </div>

                  {/* Step 1: Date picker */}
                  {step === 1 && (
                    <m.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-[#6E6E73] text-xs mb-3 uppercase tracking-[0.08em]">Select a date</p>
                      <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                        {days.map((day) => (
                          <button
                            key={formatDateISO(day)}
                            onClick={() => handleDateSelect(day)}
                            className="px-3 py-2.5 rounded-[12px] text-xs font-medium text-[#86868B] hover:text-[#F5F5F7] bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
                          >
                            {formatDateLabel(day)}
                          </button>
                        ))}
                      </div>
                    </m.div>
                  )}

                  {/* Step 2: Time slots */}
                  {step === 2 && (
                    <m.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-[#86868B] text-xs mb-1">
                        {selectedDate && formatDateLabel(selectedDate)}
                      </p>
                      <p className="text-[#6E6E73] text-xs mb-3 uppercase tracking-[0.08em]">Select a time</p>

                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#48484A]" />
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-[#86868B] text-sm text-center py-6">No available slots for this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
                          {availableSlots
                            .filter((s) => s.available)
                            .map((slot) => (
                              <button
                                key={slot.time}
                                onClick={() => setSelectedSlot(slot.time)}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[12px] text-xs font-medium text-[#86868B] hover:text-[#F5F5F7] bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
                              >
                                <Clock className="w-3 h-3" />
                                {slot.time}
                              </button>
                            ))}
                        </div>
                      )}
                    </m.div>
                  )}

                  {/* Step 3: Contact form */}
                  {step === 3 && (
                    <m.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-[12px] bg-white/[0.04] border border-white/[0.08]">
                        <Calendar className="w-3.5 h-3.5 text-[#86868B]" />
                        <span className="text-[#86868B] text-xs">
                          {selectedDate && formatDateLabel(selectedDate)}
                        </span>
                        <Clock className="w-3.5 h-3.5 text-[#86868B] ml-2" />
                        <span className="text-[#86868B] text-xs">{selectedSlot}</span>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-[12px] bg-white/[0.05] border border-white/[0.08] text-[#F5F5F7] text-sm placeholder-[#48484A] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-[#0071E3]/30 transition-all"
                        />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-[12px] bg-white/[0.05] border border-white/[0.08] text-[#F5F5F7] text-sm placeholder-[#48484A] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-[#0071E3]/30 transition-all"
                        />
                        <textarea
                          placeholder="Anything you'd like to discuss? (optional)"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-[12px] bg-white/[0.05] border border-white/[0.08] text-[#F5F5F7] text-sm placeholder-[#48484A] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-[#0071E3]/30 transition-all resize-none"
                        />

                        {error && <p className="text-[#FF453A] text-xs">{error}</p>}

                        <m.button
                          type="submit"
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium text-white transition-all disabled:opacity-50"
                          style={{
                            background: theme.primaryColor,
                          }}
                        >
                          {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" />
                              Confirm Booking
                            </>
                          )}
                        </m.button>
                      </form>
                    </m.div>
                  )}

                  {error && step < 3 && <p className="text-[#FF453A] text-xs mt-3">{error}</p>}
                </>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
