'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence, LazyMotion, domAnimation } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LivePreview } from '@/components/dashboard/live-preview'
import {
  fadeUpBlurVariants,
  staggerContainerVariants,
  spring,
  transition,
} from '@/lib/motion'
import { toast } from 'sonner'
import type { Profile, Link as LinkType } from '@/lib/types/database'
import {
  Camera,
  Link,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Loader2,
  Globe,
} from 'lucide-react'

const TOTAL_STEPS = 5

export default function OnboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Profile state
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [uploading, setUploading] = useState(false)

  // Username check
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const usernameTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Link state
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  // Created link for preview
  const [createdLinks, setCreatedLinks] = useState<LinkType[]>([])

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setUsername(profile.username || '')
          setOriginalUsername(profile.username || '')
          setDisplayName(profile.display_name || '')
          setAvatarUrl(profile.avatar_url || null)
          setBio(profile.bio || '')
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Username availability check
  const checkUsername = useCallback(async (value: string) => {
    if (value === originalUsername) {
      setUsernameAvailable(null)
      return
    }
    if (value.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value.toLowerCase())
        .single()
      setUsernameAvailable(!data)
    } catch {
      setUsernameAvailable(true)
    } finally {
      setCheckingUsername(false)
    }
  }, [originalUsername, supabase])

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(sanitized)
    setUsernameAvailable(null)

    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    usernameTimerRef.current = setTimeout(() => {
      checkUsername(sanitized)
    }, 500)
  }

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
      toast.success('Photo uploaded!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  // Save step data
  const saveStep = async (): Promise<boolean> => {
    setSaving(true)
    try {
      if (step === 0) {
        if (!username || username.length < 3) {
          toast.error('Username must be at least 3 characters')
          return false
        }
        if (username !== originalUsername && usernameAvailable === false) {
          toast.error('Username is not available')
          return false
        }
        const { error } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', userId)
        if (error) throw error
        setOriginalUsername(username)
      } else if (step === 1) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl, display_name: displayName || null })
          .eq('id', userId)
        if (error) throw error
      } else if (step === 2) {
        const { error } = await supabase
          .from('profiles')
          .update({ bio: bio || null })
          .eq('id', userId)
        if (error) throw error
      } else if (step === 3) {
        if (linkTitle && linkUrl) {
          let url = linkUrl
          if (!/^https?:\/\//i.test(url)) url = `https://${url}`

          const res = await fetch('/api/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: linkTitle, url, position: 0 }),
          })
          if (!res.ok) throw new Error('Failed to create link')
          const newLink = await res.json()
          setCreatedLinks(prev => [...prev, newLink])
        }
      } else if (step === 4) {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed_at: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
        router.push('/dashboard')
        return true
      }
      return true
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Something went wrong. Please try again.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const goNext = async () => {
    const success = await saveStep()
    if (success && step < 4) {
      setDirection(1)
      setStep(prev => prev + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(prev => prev - 1)
    }
  }

  const skipStep = () => {
    setDirection(1)
    setStep(prev => prev + 1)
  }

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/${username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${username}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName || username}'s LinkHub`, url })
        localStorage.setItem('linkhub_profile_shared', 'true')
      } catch {
        // User cancelled
      }
    } else {
      handleCopyUrl()
      localStorage.setItem('linkhub_profile_shared', 'true')
    }
  }

  // Build preview profile object
  const previewProfile: Profile = {
    id: userId,
    username,
    display_name: displayName || null,
    bio: bio || null,
    avatar_url: avatarUrl,
    theme: { primaryColor: '#0071E3', backgroundColor: '#000000', buttonStyle: 'solid' },
    is_premium: false,
    custom_domain: null,
    onboarding_completed_at: null,
    created_at: '',
    updated_at: '',
  }

  if (loading) {
    return (
      <LazyMotion features={domAnimation}>
        <div className="min-h-screen flex items-center justify-center bg-[#000000]">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-6 w-6 animate-spin text-[#0071E3]" />
            <p className="text-[#86868B] text-sm">Loading your profile...</p>
          </m.div>
        </div>
      </LazyMotion>
    )
  }

  const canProceed = step === 0
    ? username.length >= 3 && usernameAvailable !== false
    : true

  const isSkippable = step >= 1 && step <= 3
  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen flex flex-col bg-[#000000]">
        {/* Progress bar at top */}
        <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[rgba(255,255,255,0.05)]">
          <m.div
            className="h-full bg-[#0071E3]"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>

        {/* Back button */}
        {step > 0 && step < 4 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-6 left-6 z-40"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              className="text-[#86868B] hover:text-[#F5F5F7]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </m.div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[480px]">
            <AnimatePresence mode="wait" custom={direction}>
              <m.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={spring.default}
              >
                {/* ═══════════════════════════════════════════════
                    STEP 0: Choose your link
                   ═══════════════════════════════════════════════ */}
                {step === 0 && (
                  <m.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    <m.div variants={fadeUpBlurVariants} className="text-center">
                      <h1 className="lh-hero text-[#F5F5F7] mb-3">
                        Choose your link
                      </h1>
                      <p className="text-[17px] text-[#86868B]">
                        This is your unique URL
                      </p>
                    </m.div>

                    <m.div variants={fadeUpBlurVariants} className="space-y-4">
                      {/* Username input with prefix */}
                      <div className="flex items-center gap-0 rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] overflow-hidden transition-all duration-200 focus-within:border-[#0071E3] focus-within:ring-[3px] focus-within:ring-[rgba(0,113,227,0.2)]">
                        <span className="pl-4 pr-1 text-[15px] text-[#48484A] font-medium whitespace-nowrap select-none">
                          linkhub.com/
                        </span>
                        <input
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          className="flex-1 h-14 pr-12 bg-transparent text-[17px] text-[#F5F5F7] font-medium placeholder:text-[#48484A] outline-none"
                          placeholder="yourname"
                          autoFocus
                        />
                        {/* Status indicator */}
                        <div className="pr-4 flex items-center">
                          {checkingUsername && (
                            <Loader2 className="h-5 w-5 animate-spin text-[#48484A]" />
                          )}
                          {!checkingUsername && usernameAvailable === true && (
                            <m.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              <Check className="h-5 w-5 text-[#30D158]" />
                            </m.div>
                          )}
                          {!checkingUsername && usernameAvailable === false && (
                            <m.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[#FF453A] text-lg font-bold"
                            >
                              &times;
                            </m.span>
                          )}
                        </div>
                      </div>

                      {/* Availability message */}
                      <AnimatePresence mode="wait">
                        {usernameAvailable === true && (
                          <m.p
                            key="available"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[14px] text-[#30D158] flex items-center gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Username is available
                          </m.p>
                        )}
                        {usernameAvailable === false && (
                          <m.p
                            key="taken"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-[14px] text-[#FF453A]"
                          >
                            This username is taken
                          </m.p>
                        )}
                      </AnimatePresence>

                      {/* URL preview */}
                      {username.length >= 3 && (
                        <m.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 py-3"
                        >
                          <Globe className="h-4 w-4 text-[#48484A]" />
                          <span className="text-[14px] text-[#48484A]">
                            linkhub.com/
                          </span>
                          <span className="text-[14px] text-[#0071E3] font-medium">
                            @{username}
                          </span>
                        </m.div>
                      )}
                    </m.div>

                    {/* Continue button */}
                    <m.div variants={fadeUpBlurVariants}>
                      <Button
                        onClick={goNext}
                        disabled={saving || !canProceed}
                        className="w-full h-12 text-[15px] font-medium"
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </m.div>
                  </m.div>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 1: Add your photo
                   ═══════════════════════════════════════════════ */}
                {step === 1 && (
                  <m.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    <m.div variants={fadeUpBlurVariants} className="text-center">
                      <h1 className="lh-hero text-[#F5F5F7] mb-3">
                        Add your photo
                      </h1>
                      <p className="text-[17px] text-[#86868B]">
                        Help people recognize you
                      </p>
                    </m.div>

                    {/* Avatar upload */}
                    <m.div variants={fadeUpBlurVariants} className="flex flex-col items-center gap-5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="relative group"
                      >
                        <div className={cn(
                          'w-[120px] h-[120px] rounded-full flex items-center justify-center transition-all duration-300',
                          avatarUrl
                            ? 'ring-2 ring-[rgba(255,255,255,0.1)]'
                            : 'border-2 border-dashed border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)]',
                        )}>
                          {avatarUrl ? (
                            <Avatar className="w-full h-full">
                              <AvatarImage src={avatarUrl} />
                              <AvatarFallback className="bg-[#1a1a1a] text-[#86868B] text-3xl">
                                {displayName?.[0] || username?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              {uploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-[#48484A]" />
                              ) : (
                                <Camera className="h-8 w-8 text-[#48484A] group-hover:text-[#86868B] transition-colors" />
                              )}
                            </div>
                          )}

                          {/* Hover overlay for existing avatar */}
                          {avatarUrl && !uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="h-6 w-6 text-white" />
                            </div>
                          )}
                          {avatarUrl && uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                          )}

                          {/* Subtle pulsing glow ring when empty */}
                          {!avatarUrl && !uploading && (
                            <div
                              className="absolute inset-[-4px] rounded-full opacity-40"
                              style={{
                                background: 'conic-gradient(from 0deg, transparent, rgba(0,113,227,0.2), transparent)',
                                animation: 'avatar-glow 3s linear infinite',
                              }}
                            />
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-[14px] text-[#0071E3] hover:text-[#0077ED] transition-colors"
                      >
                        {uploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload photo'}
                      </button>

                      <style>{`
                        @keyframes avatar-glow {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(360deg); }
                        }
                      `}</style>
                    </m.div>

                    {/* Display name */}
                    <m.div variants={fadeUpBlurVariants} className="space-y-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-12 text-[15px]"
                        placeholder="Display name"
                      />
                    </m.div>

                    {/* Buttons */}
                    <m.div variants={fadeUpBlurVariants} className="flex flex-col gap-3">
                      <Button
                        onClick={goNext}
                        disabled={saving}
                        className="w-full h-12 text-[15px] font-medium"
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      <button
                        onClick={skipStep}
                        className="text-[14px] text-[#48484A] hover:text-[#86868B] transition-colors"
                      >
                        Skip for now
                      </button>
                    </m.div>
                  </m.div>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 2: Tell the world about you
                   ═══════════════════════════════════════════════ */}
                {step === 2 && (
                  <m.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    <m.div variants={fadeUpBlurVariants} className="text-center">
                      <h1 className="lh-hero text-[#F5F5F7] mb-3">
                        Tell the world<br />about you
                      </h1>
                      <p className="text-[17px] text-[#86868B]">
                        A short bio for your profile
                      </p>
                    </m.div>

                    <m.div variants={fadeUpBlurVariants} className="space-y-3">
                      <div className="relative">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value.slice(0, 150))}
                          className={cn(
                            'w-full h-[140px] px-4 py-3 rounded-[12px]',
                            'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)]',
                            'text-[#F5F5F7] text-[15px] resize-none',
                            'placeholder:text-[#6E6E73]',
                            'outline-none transition-all duration-200',
                            'focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.2)]'
                          )}
                          placeholder="Developer, creator, dreamer..."
                          maxLength={150}
                          autoFocus
                        />
                      </div>

                      {/* Character count */}
                      <div className="flex justify-end items-center gap-3">
                        <div className="flex items-center gap-2">
                          {/* Circular progress */}
                          <svg width="20" height="20" viewBox="0 0 20 20" className="transform -rotate-90">
                            <circle
                              cx="10" cy="10" r="8"
                              fill="none"
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="2"
                            />
                            <circle
                              cx="10" cy="10" r="8"
                              fill="none"
                              stroke={bio.length > 130 ? '#FFD60A' : bio.length > 0 ? '#0071E3' : 'transparent'}
                              strokeWidth="2"
                              strokeDasharray={`${(bio.length / 150) * 50.26} 50.26`}
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                          </svg>
                          <span className={cn(
                            'text-[13px] tabular-nums',
                            bio.length > 130 ? 'text-[#FFD60A]' : 'text-[#48484A]'
                          )}>
                            {bio.length}/150
                          </span>
                        </div>
                      </div>
                    </m.div>

                    {/* Buttons */}
                    <m.div variants={fadeUpBlurVariants} className="flex flex-col gap-3">
                      <Button
                        onClick={goNext}
                        disabled={saving}
                        className="w-full h-12 text-[15px] font-medium"
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      <button
                        onClick={skipStep}
                        className="text-[14px] text-[#48484A] hover:text-[#86868B] transition-colors"
                      >
                        Skip for now
                      </button>
                    </m.div>
                  </m.div>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 3: Add your first link
                   ═══════════════════════════════════════════════ */}
                {step === 3 && (
                  <m.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    <m.div variants={fadeUpBlurVariants} className="text-center">
                      <h1 className="lh-hero text-[#F5F5F7] mb-3">
                        Add your first link
                      </h1>
                      <p className="text-[17px] text-[#86868B]">
                        Share something you love
                      </p>
                    </m.div>

                    <m.div variants={fadeUpBlurVariants} className="space-y-4">
                      <div className="space-y-3">
                        <Input
                          value={linkTitle}
                          onChange={(e) => setLinkTitle(e.target.value)}
                          className="h-12 text-[15px]"
                          placeholder="Link title"
                          autoFocus
                        />
                        <div className="relative">
                          <Input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="h-12 text-[15px] pl-10"
                            placeholder="https://example.com"
                            type="url"
                          />
                          <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#48484A]" />
                        </div>
                      </div>

                      {/* Favicon preview */}
                      {linkUrl && /^https?:\/\/.+\..+/.test(linkUrl) && (
                        <m.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`).hostname}&sz=32`}
                            alt=""
                            className="w-5 h-5 rounded"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <span className="text-[14px] text-[#86868B] truncate">
                            {linkTitle || new URL(linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`).hostname}
                          </span>
                        </m.div>
                      )}
                    </m.div>

                    {/* Buttons */}
                    <m.div variants={fadeUpBlurVariants} className="flex flex-col gap-3">
                      <Button
                        onClick={goNext}
                        disabled={saving}
                        className="w-full h-12 text-[15px] font-medium"
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Continue'
                        )}
                      </Button>
                      <button
                        onClick={skipStep}
                        className="text-[14px] text-[#48484A] hover:text-[#86868B] transition-colors"
                      >
                        Skip for now
                      </button>
                    </m.div>
                  </m.div>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 4: You're all set!
                   ═══════════════════════════════════════════════ */}
                {step === 4 && (
                  <m.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    <m.div variants={fadeUpBlurVariants} className="text-center">
                      <h1 className="lh-hero lh-gradient-text mb-3">
                        You&apos;re all set!
                      </h1>
                      <p className="text-[17px] text-[#86868B]">
                        Your page is ready to share
                      </p>
                    </m.div>

                    {/* Phone preview */}
                    <m.div variants={fadeUpBlurVariants} className="flex justify-center">
                      <LivePreview
                        profile={previewProfile}
                        links={createdLinks}
                      />
                    </m.div>

                    {/* Profile URL */}
                    <m.div variants={fadeUpBlurVariants} className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] w-full max-w-[280px]">
                        <Globe className="h-4 w-4 text-[#48484A] shrink-0" />
                        <span className="text-[14px] text-[#86868B] truncate flex-1">
                          linkhub.com/@{username}
                        </span>
                        <button
                          onClick={handleCopyUrl}
                          className="text-[#0071E3] hover:text-[#0077ED] transition-colors shrink-0"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 w-full max-w-[280px]">
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          className="flex-1 h-11 gap-2 text-[14px]"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                        <Button
                          onClick={goNext}
                          disabled={saving}
                          className="flex-1 h-11 gap-2 text-[14px]"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Dashboard
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </m.div>

                    {/* Subtle sparkle/confetti CSS animation */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full"
                          style={{
                            left: `${10 + Math.random() * 80}%`,
                            top: '-5%',
                            background: ['#0071E3', '#00A3FF', '#30D158', '#FFD60A', '#F5F5F7'][i % 5],
                            animation: `confetti-fall ${2 + Math.random() * 3}s ease-in ${Math.random() * 2}s forwards`,
                            opacity: 0,
                          }}
                        />
                      ))}
                      <style>{`
                        @keyframes confetti-fall {
                          0% { opacity: 0; transform: translateY(0) rotate(0deg) scale(1); }
                          10% { opacity: 1; }
                          100% { opacity: 0; transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg) scale(0.5); }
                        }
                      `}</style>
                    </div>
                  </m.div>
                )}
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LazyMotion>
  )
}
