'use client'

import { ProfileWithLinks, Service } from '@/lib/types/database'
import { LinkButton } from './link-button'
import { SocialBar } from './social-bar'
import { ServiceCard } from './service-card'
import { ContactModal } from './contact-modal'
import { BookingModal } from './booking-modal'
import { PaymentModal } from './payment-modal'
import { AnimatedBackground } from './animated-background'
import { trackLinkClick } from './analytics-tracker'
import { m, AnimatePresence } from 'motion/react'
import {
  Share2, Check, BadgeCheck,
  Briefcase,
} from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import {
  spring,
  stagger,
  fadeUpVariants,
  staggerContainerVariants,
} from '@/lib/motion'

interface ProfilePageProps {
  profile: ProfileWithLinks
  services?: Service[]
  isDemo?: boolean
  heroImage?: string
  canvasVideo?: string
  canvasImages?: string[]
  customBackground?: React.ReactNode
}

export function ProfilePage({ profile, services = [], isDemo, heroImage, canvasVideo, canvasImages, customBackground }: ProfilePageProps) {
  const theme = profile.theme
  const activeLinks = profile.links.filter((l) => l.is_active)
  const activeSocials = profile.social_embeds?.filter((s) => s.is_active) || []
  const activeServices = services.filter(s => s.is_active)
  const [copied, setCopied] = useState(false)
  const [contactService, setContactService] = useState<Service | null>(null)
  const [bookingService, setBookingService] = useState<Service | null>(null)
  const [paymentService, setPaymentService] = useState<Service | null>(null)

  const totalClicks = activeLinks.reduce((sum, link) => sum + link.click_count, 0)
  const avatarUrl = profile.avatar_url || undefined
  const bannerImage = heroImage || avatarUrl
  const hasCanvas = !!(canvasVideo || (canvasImages && canvasImages.length > 0))
  const [canvasIndex, setCanvasIndex] = useState(0)
  const canvasTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Canvas image slideshow — cycle through images every 4s
  // Keep running until video is ready (acts as placeholder)
  useEffect(() => {
    if (!canvasImages || canvasImages.length <= 1) return
    if (videoReady) {
      // Stop slideshow once video takes over
      if (canvasTimerRef.current) clearInterval(canvasTimerRef.current)
      return
    }
    canvasTimerRef.current = setInterval(() => {
      setCanvasIndex(prev => (prev + 1) % canvasImages.length)
    }, 4000)
    return () => {
      if (canvasTimerRef.current) clearInterval(canvasTimerRef.current)
    }
  }, [canvasImages, videoReady])

  const shareProfile = useCallback(async () => {
    const url = `${window.location.origin}/${profile.username}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: profile.display_name || profile.username,
          text: profile.bio || '',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [profile])

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.backgroundColor }}>

      {/* Background */}
      {customBackground ? customBackground : (
        <AnimatedBackground
          primaryColor={theme.primaryColor}
          backgroundColor={theme.backgroundColor}
        />
      )}

      {/* ===== Spotify Canvas — video or cinematic image slideshow ===== */}
      {(hasCanvas || bannerImage) && (
        <div className="absolute inset-x-0 top-0 h-[50vh] overflow-hidden z-[1]">

          {/* Cinematic image slideshow — shows immediately, stays until video loads */}
          {canvasImages && canvasImages.length > 0 && (
            <div className="absolute inset-[-15%]">
              {canvasImages.map((src, i) => (
                <m.div
                  key={src}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: canvasIndex === i ? 1 : 0,
                    scale: canvasIndex === i ? [1.05, 1.15] : 1.05,
                    x: canvasIndex === i ? ['0%', i % 2 === 0 ? '3%' : '-3%'] : '0%',
                    y: canvasIndex === i ? ['0%', i % 3 === 0 ? '-2%' : '2%'] : '0%',
                  }}
                  transition={{
                    opacity: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
                    scale: { duration: 4, ease: [0.25, 0.1, 0.25, 1] },
                    x: { duration: 4, ease: [0.25, 0.1, 0.25, 1] },
                    y: { duration: 4, ease: [0.25, 0.1, 0.25, 1] },
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.45) saturate(1.6)', objectPosition: 'center 25%' }}
                  />
                </m.div>
              ))}
            </div>
          )}

          {/* Video layer — loads in background, fades in smoothly over images */}
          {canvasVideo && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: videoReady ? 1 : 0 }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-[-5%] z-[1]"
            >
              <video
                ref={videoRef}
                src={canvasVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onCanPlayThrough={() => setVideoReady(true)}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.5) saturate(1.4)', objectPosition: 'center 25%' }}
              />
            </m.div>
          )}

          {/* Single banner image with drift (fallback when no canvas) */}
          {!canvasVideo && (!canvasImages || canvasImages.length === 0) && bannerImage && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-[-20%] hero-banner-drift"
            >
              <img
                src={bannerImage}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                style={{ filter: heroImage ? 'blur(20px) saturate(1.8) brightness(0.4)' : 'blur(50px) saturate(1.5) brightness(0.45)', objectPosition: 'center 25%' }}
              />
            </m.div>
          )}

          {/* Color pulse overlays */}
          <div
            className="absolute inset-0 hero-color-pulse"
            style={{
              background: `radial-gradient(ellipse at 30% 40%, ${theme.primaryColor}40 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute inset-0 hero-color-pulse-alt"
            style={{
              background: `radial-gradient(ellipse at 70% 60%, ${theme.primaryColor}30 0%, transparent 60%)`,
            }}
          />
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '128px 128px',
            }}
          />
          {/* Bottom gradient fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-[70%]"
            style={{
              background: `linear-gradient(to top, ${theme.backgroundColor} 0%, ${theme.backgroundColor}E6 20%, ${theme.backgroundColor}99 45%, transparent 100%)`,
            }}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center top, transparent 30%, ${theme.backgroundColor}CC 100%)`,
            }}
          />
        </div>
      )}

      {/* Share button — top right */}
      <m.button
        onClick={shareProfile}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, ...spring.default }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        title="Share profile"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <m.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring.snappy}>
              <Check className="w-4 h-4 text-[#30D158]" />
            </m.span>
          ) : (
            <m.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Share2 className="w-4 h-4 text-[#86868B]" />
            </m.span>
          )}
        </AnimatePresence>
      </m.button>

      {/* Profile content — centered, narrow, overlaps hero banner */}
      <div className="relative z-[2] flex flex-col items-center px-6 pt-[28vh] pb-8 max-w-[480px] mx-auto min-h-screen">

        {/* Avatar — sitting on the hero/content boundary */}
        <m.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring.bouncy, delay: 0.1 }}
          className="relative mb-4"
        >
          {/* Outer glow ring */}
          <div
            className="absolute -inset-[5px] rounded-full"
            style={{
              border: `2px solid ${theme.primaryColor}55`,
              boxShadow: `0 0 30px ${theme.primaryColor}33, 0 0 60px ${theme.primaryColor}15`,
            }}
          />
          {/* Avatar image */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-black/50">
            <img
              src={avatarUrl}
              alt={profile.display_name || profile.username}
              className="w-full h-full object-cover"
            />
          </div>
        </m.div>

        {/* Display name + verified badge */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: [0, 0, 0.2, 1] }}
          className="flex items-center gap-1.5 mb-1"
        >
          <h1
            className="text-2xl sm:text-[28px] font-bold text-[#F5F5F7] tracking-tight"
            style={{ fontFamily: theme.fontFamily || 'inherit' }}
          >
            {profile.display_name || profile.username}
          </h1>
          {profile.is_premium && (
            <div className="relative group">
              <BadgeCheck className="w-4 h-4 text-[#0071E3]" />
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] text-[#86868B] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/5">
                Verified Creator
              </div>
            </div>
          )}
        </m.div>

        {/* Bio */}
        {profile.bio && (
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3, ease: [0, 0, 0.2, 1] }}
            className="text-[15px] text-[#86868B] text-center max-w-sm leading-[1.5] line-clamp-2 mb-2"
          >
            {profile.bio}
          </m.p>
        )}

        {/* Stats — simple text */}
        {isDemo && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[13px] text-[#6E6E73] mb-5"
          >
            {activeLinks.length} links &bull; {totalClicks >= 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : totalClicks} clicks
          </m.p>
        )}

        {/* Social bar */}
        {activeSocials.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="mb-7"
          >
            <SocialBar socials={activeSocials} primaryColor={theme.primaryColor} />
          </m.div>
        )}

        {/* Links */}
        <m.div
          className="w-full space-y-3"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeLinks.map((link, index) => (
            <m.div
              key={link.id}
              variants={fadeUpVariants}
              transition={{
                delay: 0.4 + index * stagger.normal,
                duration: 0.3,
                ease: [0, 0, 0.2, 1],
              }}
            >
              <LinkButton
                link={link}
                theme={theme}
                onClick={() => { if (!isDemo) trackLinkClick(profile.id, link.id) }}
                showClicks={isDemo}
              />
            </m.div>
          ))}
        </m.div>

        {/* Services section */}
        {activeServices.length > 0 && (
          <m.div
            className="w-full mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + activeLinks.length * stagger.normal }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#6E6E73]" />
              <h2 className="text-xs font-medium text-[#6E6E73] uppercase tracking-[0.08em]">Services</h2>
            </div>
            <div className="space-y-3">
              {activeServices.map((service, index) => (
                <m.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.7 + activeLinks.length * stagger.normal + index * stagger.normal,
                    duration: 0.3,
                    ease: [0, 0, 0.2, 1],
                  }}
                >
                  <ServiceCard
                    service={service}
                    theme={theme}
                    onContact={setContactService}
                    onBooking={setBookingService}
                    onPayment={setPaymentService}
                  />
                </m.div>
              ))}
            </div>
          </m.div>
        )}

        {/* Footer — "Made with LinkHub" */}
        {!profile.is_premium && (
          <m.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-[12px] text-[#48484A] hover:text-[#6E6E73] transition-colors duration-200"
          >
            Made with LinkHub
          </m.a>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        service={contactService!}
        theme={theme}
        isOpen={!!contactService}
        onClose={() => setContactService(null)}
      />

      {/* Booking Modal */}
      <BookingModal
        service={bookingService!}
        theme={theme}
        isOpen={!!bookingService}
        onClose={() => setBookingService(null)}
        username={profile.username}
      />

      {/* Payment Modal */}
      <PaymentModal
        service={paymentService!}
        theme={theme}
        isOpen={!!paymentService}
        onClose={() => setPaymentService(null)}
        username={profile.username}
      />
    </div>
  )
}
