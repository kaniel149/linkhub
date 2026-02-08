'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { m, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LivePreview } from '@/components/dashboard/live-preview'
import {
  fadeUpBlurVariants,
  staggerContainerVariants,
  spring,
} from '@/lib/motion'
import { toast } from 'sonner'
import type { Profile, Link as LinkType } from '@/lib/types/database'
import {
  AtSign,
  Camera,
  FileText,
  Link,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Loader2,
} from 'lucide-react'

const STEPS = [
  { icon: AtSign, title: 'Choose your username', subtitle: 'Pick a unique URL for your profile' },
  { icon: Camera, title: 'Add your photo & name', subtitle: 'Help people recognize you' },
  { icon: FileText, title: 'Write your bio', subtitle: 'Tell the world who you are' },
  { icon: Link, title: 'Add your first link', subtitle: 'Share something you love' },
  { icon: Sparkles, title: "You're all set!", subtitle: 'Your profile is ready to share' },
]

export default function OnboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
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
        // Save username
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
        // Save avatar + display name
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl, display_name: displayName || null })
          .eq('id', userId)
        if (error) throw error
      } else if (step === 2) {
        // Save bio
        const { error } = await supabase
          .from('profiles')
          .update({ bio: bio || null })
          .eq('id', userId)
        if (error) throw error
      } else if (step === 3) {
        // Add link
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
        // Complete onboarding
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
        // Set shared flag for profile completion
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
    theme: { primaryColor: '#a855f7', backgroundColor: '#09090b', buttonStyle: 'solid' },
    is_premium: false,
    custom_domain: null,
    onboarding_completed_at: null,
    created_at: '',
    updated_at: '',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-zinc-400 text-sm">Loading your profile...</p>
        </m.div>
      </div>
    )
  }

  const canProceed = step === 0
    ? username.length >= 3 && usernameAvailable !== false
    : true

  const isSkippable = step >= 1 && step <= 3

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-black to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Progress dots */}
      <m.div
        className="flex items-center gap-2 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < step) {
                setDirection(-1)
                setStep(i)
              }
            }}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === step
                ? 'w-8 bg-gradient-to-r from-purple-500 to-indigo-500'
                : i < step
                  ? 'w-2 bg-purple-500/60 cursor-pointer hover:bg-purple-400'
                  : 'w-2 bg-zinc-700'
            )}
          />
        ))}
      </m.div>

      {/* Step content */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait" custom={direction}>
          <m.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={spring.default}
          >
            {/* Step header */}
            <m.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="text-center mb-8"
            >
              <m.div
                variants={fadeUpBlurVariants}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-4"
              >
                {(() => {
                  const Icon = STEPS[step].icon
                  return <Icon className="h-7 w-7 text-purple-400" />
                })()}
              </m.div>
              <m.h1
                variants={fadeUpBlurVariants}
                className="text-2xl font-bold text-white"
              >
                {STEPS[step].title}
              </m.h1>
              <m.p
                variants={fadeUpBlurVariants}
                className="text-zinc-400 mt-1"
              >
                {STEPS[step].subtitle}
              </m.p>
            </m.div>

            {/* Step 0: Username */}
            {step === 0 && (
              <m.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <m.div variants={fadeUpBlurVariants} className="space-y-3">
                  <Label htmlFor="username" className="text-zinc-300">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="bg-zinc-900/80 border-zinc-700 h-12 text-lg pl-4 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="yourname"
                      autoFocus
                    />
                    {checkingUsername && (
                      <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-zinc-400" />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <Check className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                  </div>

                  {usernameAvailable === true && (
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Username is available!
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-sm text-red-400">
                      This username is taken. Try another one.
                    </p>
                  )}

                  {/* URL preview */}
                  <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <Link className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="text-sm text-zinc-500">linkhub.app/</span>
                    <span className="text-sm text-purple-400 font-medium">
                      {username || 'yourname'}
                    </span>
                  </div>
                </m.div>
              </m.div>
            )}

            {/* Step 1: Avatar + Name */}
            {step === 1 && (
              <m.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Avatar upload */}
                <m.div variants={fadeUpBlurVariants} className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 ring-4 ring-purple-500/20">
                      <AvatarImage src={avatarUrl || ''} />
                      <AvatarFallback className="bg-purple-500/20 text-purple-400 text-3xl">
                        {displayName?.[0] || username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={cn(
                        'absolute inset-0 flex items-center justify-center rounded-full',
                        'bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity',
                        uploading && 'opacity-100'
                      )}
                    >
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {uploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                </m.div>

                {/* Display name */}
                <m.div variants={fadeUpBlurVariants} className="space-y-2">
                  <Label htmlFor="displayName" className="text-zinc-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-zinc-900/80 border-zinc-700 h-12 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="Your Name"
                  />
                </m.div>
              </m.div>
            )}

            {/* Step 2: Bio */}
            {step === 2 && (
              <m.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <m.div variants={fadeUpBlurVariants} className="space-y-2">
                  <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 150))}
                    className={cn(
                      'w-full h-32 px-4 py-3 bg-zinc-900/80 border border-zinc-700 rounded-lg',
                      'text-white text-sm resize-none',
                      'placeholder:text-zinc-500',
                      'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                    )}
                    placeholder="Tell people about yourself in a few words..."
                    maxLength={150}
                    autoFocus
                  />
                  <div className="flex justify-end">
                    <span className={cn(
                      'text-xs',
                      bio.length > 130 ? 'text-amber-400' : 'text-zinc-500'
                    )}>
                      {bio.length}/150
                    </span>
                  </div>
                </m.div>
              </m.div>
            )}

            {/* Step 3: Add Link */}
            {step === 3 && (
              <m.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <m.div variants={fadeUpBlurVariants} className="space-y-2">
                  <Label htmlFor="linkTitle" className="text-zinc-300">Link Title</Label>
                  <Input
                    id="linkTitle"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="bg-zinc-900/80 border-zinc-700 h-12 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="My Website"
                    autoFocus
                  />
                </m.div>

                <m.div variants={fadeUpBlurVariants} className="space-y-2">
                  <Label htmlFor="linkUrl" className="text-zinc-300">URL</Label>
                  <Input
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="bg-zinc-900/80 border-zinc-700 h-12 focus:border-purple-500 focus:ring-purple-500/20"
                    placeholder="https://example.com"
                    type="url"
                  />
                </m.div>
              </m.div>
            )}

            {/* Step 4: All Set! */}
            {step === 4 && (
              <m.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Phone preview */}
                <m.div variants={fadeUpBlurVariants} className="flex justify-center">
                  <LivePreview
                    profile={previewProfile}
                    links={createdLinks}
                  />
                </m.div>

                {/* Share actions */}
                <m.div variants={fadeUpBlurVariants} className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg w-full max-w-xs">
                    <span className="text-sm text-zinc-400 truncate flex-1">
                      linkhub.app/{username}
                    </span>
                    <button
                      onClick={handleCopyUrl}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="gap-2 border-zinc-700 text-zinc-300 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                    Share your profile
                  </Button>
                </m.div>
              </m.div>
            )}
          </m.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <m.div
        className="flex items-center gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {step > 0 && step < 4 && (
          <Button
            variant="ghost"
            onClick={goBack}
            className="gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        {isSkippable && (
          <Button
            variant="ghost"
            onClick={skipStep}
            className="text-zinc-500 hover:text-zinc-300"
          >
            Skip
          </Button>
        )}

        <Button
          onClick={goNext}
          disabled={saving || !canProceed}
          className={cn(
            'gap-2 min-w-[140px]',
            step === 4
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
              : 'bg-purple-600 hover:bg-purple-700'
          )}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : step === 4 ? (
            <>
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </m.div>

      {/* Step counter */}
      <p className="text-xs text-zinc-600 mt-4">
        Step {step + 1} of {STEPS.length}
      </p>
    </div>
  )
}
