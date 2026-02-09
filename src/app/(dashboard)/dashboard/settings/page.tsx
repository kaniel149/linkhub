'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'
import { toast } from 'sonner'
import { User, AtSign, FileText, Link, Camera, Trash2, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [originalUsername, setOriginalUsername] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setOriginalUsername(data.username)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (username === originalUsername) {
      setUsernameAvailable(null)
      return
    }

    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    setCheckingUsername(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single()

      setUsernameAvailable(!data)
    } catch {
      setUsernameAvailable(true)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setProfile(prev => ({ ...prev, username: sanitized }))

    const timer = setTimeout(() => {
      checkUsernameAvailability(sanitized)
    }, 500)
    return () => clearTimeout(timer)
  }

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setProfile(prev => ({ ...prev, avatar_url: `${publicUrl}?t=${Date.now()}` }))
      toast.success('Avatar uploaded!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const saveProfile = async () => {
    if (profile.username !== originalUsername && !usernameAvailable) {
      toast.error('Username is not available')
      return
    }

    if (!profile.username || profile.username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setOriginalUsername(profile.username || '')
      setUsernameAvailable(null)
      toast.success('Profile saved successfully!')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[24px] font-bold text-[#F5F5F7] mb-6">Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-[var(--lh-surface-3)] rounded-xl" />
          <div className="h-48 bg-[var(--lh-surface-3)] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#F5F5F7]">Settings</h1>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Avatar Section */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
        <CardHeader>
          <CardTitle className="text-[#F5F5F7] text-[15px] flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#86868B]" />
            Profile Picture
          </CardTitle>
          <CardDescription>Upload a profile picture (max 2MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 ring-2 ring-[rgba(255,255,255,0.08)]">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="bg-[rgba(0,113,227,0.1)] text-[#0071E3] text-2xl">
                {profile.display_name?.[0] || profile.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload New'}
              </Button>
              {profile.avatar_url && (
                <Button
                  variant="ghost"
                  className="text-[#FF453A] hover:text-[#FF453A] hover:bg-[rgba(255,69,58,0.1)]"
                  onClick={() => setProfile(prev => ({ ...prev, avatar_url: null }))}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Username Section */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
        <CardHeader>
          <CardTitle className="text-[#F5F5F7] text-[15px] flex items-center gap-2">
            <AtSign className="h-4 w-4 text-[#86868B]" />
            Username
          </CardTitle>
          <CardDescription>Your unique profile URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#6E6E73]">linkhub.app/</span>
              <Input
                id="username"
                value={profile.username || ''}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="flex-1"
                placeholder="yourname"
              />
            </div>
            {checkingUsername && (
              <p className="text-[12px] text-[#86868B]">Checking availability...</p>
            )}
            {usernameAvailable === true && (
              <p className="text-[12px] text-[#30D158]">Username is available!</p>
            )}
            {usernameAvailable === false && (
              <p className="text-[12px] text-[#FF453A]">Username is taken</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Info Section */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
        <CardHeader>
          <CardTitle className="text-[#F5F5F7] text-[15px] flex items-center gap-2">
            <User className="h-4 w-4 text-[#86868B]" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profile.display_name || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full h-24 px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[10px] text-[14px] text-[#F5F5F7] placeholder:text-[#6E6E73] resize-none focus:outline-none focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.2)] transition-all duration-200"
              placeholder="Tell people about yourself..."
              maxLength={150}
            />
            <p className="text-[11px] text-[#6E6E73]">
              {(profile.bio?.length || 0)}/150 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Public Profile Link */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]">
        <CardHeader>
          <CardTitle className="text-[#F5F5F7] text-[15px] flex items-center gap-2">
            <Link className="h-4 w-4 text-[#86868B]" />
            Your Public Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl">
            <span className="text-[13px] text-[#86868B] flex-1 truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}/{profile.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/${profile.username}`
                )
                toast.success('Link copied!')
              }}
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
                Visit
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,69,58,0.15)]">
        <CardHeader>
          <CardTitle className="text-[#FF453A] text-[15px] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="text-[#FF453A] border-[rgba(255,69,58,0.3)] hover:bg-[rgba(255,69,58,0.1)] hover:border-[rgba(255,69,58,0.5)]"
            onClick={() => toast.error('Account deletion is not yet implemented')}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
