'use client'

import { ProfileWithLinks, Service } from '@/lib/types/database'
import { LinkButton } from './link-button'
import { SocialBar } from './social-bar'
import { ServiceCard } from './service-card'
import { ContactModal } from './contact-modal'
import { trackLinkClick } from './analytics-tracker'
import { m, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react'
import {
  Share2, Check, BadgeCheck, Eye, MousePointerClick,
  Link as LinkIcon, ArrowRight, Sparkles, Briefcase,
} from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'

interface ProfilePageProps {
  profile: ProfileWithLinks
  services?: Service[]
  isDemo?: boolean
}

/* ─── floating node particles ─── */
function FloatingNodes({ color }: { color: string }) {
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3.5,
    duration: 4 + Math.random() * 12,
    delay: Math.random() * 6,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {nodes.map((n) => (
        <m.div
          key={n.id}
          className="absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: n.size,
            height: n.size,
            background: color,
            boxShadow: `0 0 ${n.size * 5}px ${color}90`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0.05, 0.8, 0.05],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: n.duration,
            repeat: Infinity,
            delay: n.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ─── connection lines between nodes ─── */
function ConnectionLines({ color }: { color: string }) {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x1: 10 + Math.random() * 80,
    y1: 10 + Math.random() * 80,
    x2: 10 + Math.random() * 80,
    y2: 10 + Math.random() * 80,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
  }))

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.07 }}>
      {lines.map((l) => (
        <m.line
          key={l.id}
          x1={`${l.x1}%`}
          y1={`${l.y1}%`}
          x2={`${l.x2}%`}
          y2={`${l.y2}%`}
          stroke={color}
          strokeWidth="0.5"
          animate={{
            x1: [`${l.x1}%`, `${l.x1 + (Math.random() - 0.5) * 25}%`, `${l.x1}%`],
            y1: [`${l.y1}%`, `${l.y1 + (Math.random() - 0.5) * 25}%`, `${l.y1}%`],
            x2: [`${l.x2}%`, `${l.x2 + (Math.random() - 0.5) * 25}%`, `${l.x2}%`],
            y2: [`${l.y2}%`, `${l.y2 + (Math.random() - 0.5) * 25}%`, `${l.y2}%`],
            opacity: [0.2, 0.9, 0.2],
          }}
          transition={{ duration: l.duration, repeat: Infinity, delay: l.delay, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

/* ─── animated count-up ─── */
function CountUp({ target, suffix = '', duration = 2, delay = 0 }: {
  target: number; suffix?: string; duration?: number; delay?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => {
      let start = 0
      const increment = target / (duration * 60)
      const step = () => {
        start += increment
        if (start >= target) {
          setCount(target)
          return
        }
        setCount(Math.floor(start))
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, target, duration, delay])

  return (
    <span ref={ref} className="tabular-nums font-semibold text-white/90">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

/* ─── typing bio effect ─── */
function TypingBio({ text, delay = 0.5 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
          setTimeout(() => setShowCursor(false), 1500)
        }
      }, 25)
      return () => clearInterval(interval)
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [text, delay])

  return (
    <span>
      {displayed}
      {showCursor && (
        <m.span
          className="inline-block w-[2px] h-[14px] ml-0.5 align-middle"
          style={{ background: 'currentColor' }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  )
}

/* ─── shimmer glint effect for link cards ─── */
function ShimmerOverlay({ color, delay }: { color: string; delay: number }) {
  return (
    <m.div
      className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 1 }}
    >
      <m.div
        className="absolute -inset-full h-full w-[200%]"
        style={{
          background: `linear-gradient(90deg, transparent 30%, ${color}08 45%, ${color}15 50%, ${color}08 55%, transparent 70%)`,
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5 + Math.random() * 5,
          ease: 'easeInOut',
          delay: delay + 2 + Math.random() * 3,
        }}
      />
    </m.div>
  )
}

/* ─── main profile ─── */
export function ProfilePage({ profile, services = [], isDemo }: ProfilePageProps) {
  const theme = profile.theme
  const activeLinks = profile.links.filter((l) => l.is_active)
  const activeSocials = profile.social_embeds?.filter((s) => s.is_active) || []
  const activeServices = services.filter(s => s.is_active)
  const [copied, setCopied] = useState(false)
  const [contactService, setContactService] = useState<Service | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0])
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.15])

  const totalClicks = activeLinks.reduce((sum, link) => sum + link.click_count, 0)

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

  const heroImage = isDemo ? '/demo/hero-banner.jpg' : null

  return (
    <div ref={containerRef} className="min-h-screen relative" style={{ backgroundColor: theme.backgroundColor }}>

      {/* ═══ ANIMATED BACKGROUND ═══ */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: theme.backgroundColor }}>
        <m.div
          className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full blur-[160px]"
          style={{ background: theme.primaryColor, opacity: 0.07 }}
          animate={{ x: [0, 100, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: theme.primaryColor, opacity: 0.05 }}
          animate={{ x: [0, -70, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor}40, transparent)` }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <FloatingNodes color={theme.primaryColor} />
        <ConnectionLines color={theme.primaryColor} />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* ═══ IMMERSIVE HERO BANNER ═══ */}
      {heroImage && (
        <m.div
          className="relative w-full h-[440px] sm:h-[500px] lg:h-[540px] overflow-hidden"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <m.img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover object-[center_15%]"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Tech grid overlay */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `linear-gradient(${theme.primaryColor}30 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor}30 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
          {/* Diagonal circuits */}
          <m.div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(45deg, ${theme.primaryColor}20 25%, transparent 25%, transparent 75%, ${theme.primaryColor}20 75%)`,
              backgroundSize: '120px 120px',
            }}
            animate={{ backgroundPosition: ['0px 0px', '120px 120px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          {/* Scan line */}
          <m.div
            className="absolute left-0 right-0 h-[3px] pointer-events-none z-10"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${theme.primaryColor}40 20%, ${theme.primaryColor}80 50%, ${theme.primaryColor}40 80%, transparent 100%)`,
              boxShadow: `0 0 20px ${theme.primaryColor}40, 0 0 60px ${theme.primaryColor}20`,
            }}
            animate={{ top: ['-5%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          />
          {/* Glow orbs */}
          <m.div
            className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full blur-[60px]"
            style={{ background: theme.primaryColor, opacity: 0.15 }}
            animate={{ opacity: [0.08, 0.2, 0.08], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <m.div
            className="absolute top-[30%] left-[5%] w-24 h-24 rounded-full blur-[50px]"
            style={{ background: theme.primaryColor, opacity: 0.1 }}
            animate={{ opacity: [0.05, 0.15, 0.05], scale: [1.1, 0.9, 1.1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          {/* Color grade */}
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ background: `radial-gradient(ellipse at 50% 30%, ${theme.primaryColor}18, transparent 70%)` }}
          />
          {/* Bottom fade */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, ${theme.backgroundColor}10 0%, ${theme.backgroundColor}00 15%, ${theme.backgroundColor}00 35%, ${theme.backgroundColor}50 58%, ${theme.backgroundColor}c0 78%, ${theme.backgroundColor}f5 90%, ${theme.backgroundColor} 100%)`,
          }} />
          {/* Side vignettes */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(90deg, ${theme.backgroundColor}b0 0%, transparent 22%, transparent 78%, ${theme.backgroundColor}b0 100%)`,
          }} />
          {/* Top fade */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(180deg, ${theme.backgroundColor}70 0%, transparent 18%)`,
          }} />
          {/* Animated bottom glow line */}
          <m.div
            className="absolute bottom-0 left-0 right-0 h-[2px] z-10"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.primaryColor}80, transparent)` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Scanlines */}
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
          }} />
        </m.div>
      )}

      {/* ═══ SHARE BUTTON (floating) ═══ */}
      <m.button
        onClick={shareProfile}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-full bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.12] transition-all duration-300 cursor-pointer"
        title="Share profile"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <m.span key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Check className="w-4 h-4 text-emerald-400" />
            </m.span>
          ) : (
            <m.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Share2 className="w-4 h-4" />
            </m.span>
          )}
        </AnimatePresence>
      </m.button>

      {/* ═══ PROFILE CONTENT ═══ */}
      <div className={`relative flex flex-col items-center px-4 pb-12 ${heroImage ? '-mt-32 sm:-mt-36' : 'pt-16'}`}>

        {/* ─── Avatar ─── */}
        <m.div
          initial={{ opacity: 0, y: 50, scale: 0.7, rotate: -5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.15 }}
          className="relative mb-5"
        >
          {/* Outer glow ring — rotating conic gradient */}
          <m.div
            className="absolute -inset-2.5 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${theme.primaryColor}, ${theme.primaryColor}20, ${theme.primaryColor}, ${theme.primaryColor}20, ${theme.primaryColor})`,
              opacity: 0.7,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Secondary counter-rotating ring */}
          <m.div
            className="absolute -inset-3.5 rounded-full opacity-30"
            style={{
              background: `conic-gradient(from 180deg, transparent, ${theme.primaryColor}40, transparent, ${theme.primaryColor}40, transparent)`,
            }}
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Pulsing blur glow */}
          <m.div
            className="absolute -inset-5 rounded-full blur-xl"
            style={{ background: theme.primaryColor, opacity: 0.3 }}
            animate={{ opacity: [0.1, 0.45, 0.1], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Avatar image */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-2 ring-white/10 z-10">
            <img
              src={profile.avatar_url || undefined}
              alt={profile.display_name || profile.username}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Status dot */}
          <m.div
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 z-20"
            style={{ borderColor: theme.backgroundColor }}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: 0.8, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </m.div>

        {/* ─── Name with gradient shimmer ─── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0, 0, 0.2, 1] }}
          className="flex items-center gap-2.5 mb-1"
        >
          <h1
            className="relative text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ fontFamily: theme.fontFamily || 'inherit' }}
          >
            {/* Animated gradient text */}
            <m.span
              className="bg-clip-text text-transparent bg-[length:200%_100%]"
              style={{
                backgroundImage: `linear-gradient(90deg, #ffffff 0%, ${theme.primaryColor} 30%, #ffffff 50%, ${theme.primaryColor} 70%, #ffffff 100%)`,
              }}
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              {profile.display_name || profile.username}
            </m.span>
          </h1>
          {profile.is_premium && (
            <m.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 400, damping: 12 }}
              className="relative group"
            >
              <m.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ delay: 1.5, duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
              >
                <BadgeCheck className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </m.div>
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/5">
                Verified Creator
              </div>
            </m.div>
          )}
        </m.div>

        {/* ─── Username ─── */}
        <m.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="text-sm text-white/30 mb-3 font-mono tracking-wide"
        >
          @{profile.username}
        </m.p>

        {/* ─── Bio with typing effect ─── */}
        {profile.bio && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-white/50 max-w-sm mx-auto text-sm leading-relaxed text-center mb-5"
          >
            <TypingBio text={profile.bio} delay={0.6} />
          </m.p>
        )}

        {/* ─── Stats bar with animated border ─── */}
        {isDemo && (
          <m.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mb-7"
          >
            {/* Animated border glow */}
            <m.div
              className="absolute -inset-[1px] rounded-full opacity-50"
              style={{
                background: `conic-gradient(from 0deg, ${theme.primaryColor}60, transparent 30%, transparent 70%, ${theme.primaryColor}60)`,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative flex items-center gap-1 px-5 py-2.5 rounded-full bg-white/[0.04] backdrop-blur-md">
              <div className="flex items-center gap-1.5 px-3 text-xs">
                <Eye className="w-3.5 h-3.5 text-white/30" />
                <CountUp target={12400} suffix="" delay={0.8} />
                <span className="text-white/30">views</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5 px-3 text-xs">
                <MousePointerClick className="w-3.5 h-3.5 text-white/30" />
                <CountUp target={totalClicks} delay={1} />
                <span className="text-white/30">clicks</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5 px-3 text-xs">
                <LinkIcon className="w-3.5 h-3.5 text-white/30" />
                <CountUp target={activeLinks.length} suffix="" duration={0.5} delay={1.2} />
                <span className="text-white/30">links</span>
              </div>
            </div>
          </m.div>
        )}

        {/* ─── Social icons ─── */}
        {activeSocials.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <SocialBar socials={activeSocials} primaryColor={theme.primaryColor} />
          </m.div>
        )}

        {/* ─── Links with shimmer effect ─── */}
        <div className="w-full max-w-md space-y-3">
          {activeLinks.map((link, index) => (
            <m.div
              key={link.id}
              className="relative"
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{
                delay: 0.6 + index * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ShimmerOverlay color={theme.primaryColor} delay={0.6 + index * 0.1} />
              <LinkButton
                link={link}
                theme={theme}
                onClick={() => { if (!isDemo) trackLinkClick(profile.id, link.id) }}
                showClicks={isDemo}
              />
            </m.div>
          ))}
        </div>

        {/* ─── Services section ─── */}
        {activeServices.length > 0 && (
          <m.div
            className="w-full max-w-md mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + activeLinks.length * 0.1 }}
          >
            <m.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 + activeLinks.length * 0.1 }}
            >
              <Briefcase className="w-4 h-4 text-white/30" />
              <h2 className="text-sm font-medium text-white/30 uppercase tracking-wider">Services</h2>
            </m.div>
            <div className="space-y-3">
              {activeServices.map((service, index) => (
                <m.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.9 + activeLinks.length * 0.1 + index * 0.1,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <ServiceCard
                    service={service}
                    theme={theme}
                    onContact={setContactService}
                  />
                </m.div>
              ))}
            </div>
          </m.div>
        )}

        {/* ─── Powered by LinkHub ─── */}
        {!profile.is_premium && (
          <m.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.06] transition-all duration-300"
          >
            <span className="w-3.5 h-3.5 rounded-sm bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-[7px] font-black text-white">L</span>
            Powered by LinkHub
          </m.a>
        )}

        {/* ─── Demo CTA with pulse glow ─── */}
        {isDemo && (
          <m.a
            href="/"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, type: 'spring', stiffness: 150, damping: 20 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative mt-14 flex items-center gap-3 px-7 py-3.5 rounded-full border transition-all duration-300 overflow-hidden"
            style={{
              borderColor: `${theme.primaryColor}25`,
              background: `linear-gradient(135deg, ${theme.primaryColor}0a, transparent)`,
            }}
          >
            {/* Pulse glow behind CTA */}
            <m.div
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(ellipse at center, ${theme.primaryColor}15, transparent 70%)` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Shimmer sweep */}
            <m.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.primaryColor}10 50%, transparent 100%)`,
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            />
            <m.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="relative w-4 h-4 transition-colors" style={{ color: `${theme.primaryColor}80` }} />
            </m.div>
            <span className="relative text-sm text-white/50 group-hover:text-white/80 transition-colors">
              Create your page — it&apos;s free
            </span>
            <m.div
              className="relative"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-all" />
            </m.div>
          </m.a>
        )}
      </div>

      {/* ═══ CONTACT MODAL ═══ */}
      <ContactModal
        service={contactService!}
        theme={theme}
        isOpen={!!contactService}
        onClose={() => setContactService(null)}
      />
    </div>
  )
}
