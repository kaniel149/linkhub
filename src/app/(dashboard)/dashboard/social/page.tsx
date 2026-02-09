'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { SocialEmbed, getPlanLimits } from '@/lib/types/database'
import { toast } from 'sonner'
import { Plus, Trash2, GripVertical, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { m, AnimatePresence } from 'motion/react'

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/p/...', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@user/video/...', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/watch?v=...', icon: '🎬' },
  { value: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/track/...', icon: '🎧' },
  { value: 'twitter', label: 'X (Twitter)', placeholder: 'https://twitter.com/user/status/...', icon: '𝕏' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/...', icon: '💼' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/username', icon: '💻' },
] as const

type Platform = typeof PLATFORMS[number]['value']

export default function SocialPage() {
  const [embeds, setEmbeds] = useState<SocialEmbed[]>([])
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newPlatform, setNewPlatform] = useState<Platform>('instagram')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const limits = getPlanLimits(isPremium)

  useEffect(() => {
    loadEmbeds()
  }, [])

  const loadEmbeds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      setIsPremium(profile?.is_premium || false)

      const { data } = await supabase
        .from('social_embeds')
        .select('*')
        .eq('profile_id', user.id)
        .order('position')

      if (data) {
        setEmbeds(data)
      }
    } catch (error) {
      console.error('Failed to load embeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEmbed = async () => {
    if (!newUrl) {
      toast.error('Please enter a URL')
      return
    }

    if (embeds.length >= limits.maxSocialEmbeds) {
      toast.error(`Free plan limited to ${limits.maxSocialEmbeds} embeds. Upgrade to Premium!`)
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('social_embeds')
        .insert({
          profile_id: user.id,
          platform: newPlatform,
          embed_url: newUrl,
          position: embeds.length,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setEmbeds([...embeds, data])
      setNewUrl('')
      setIsAdding(false)
      toast.success('Social embed added!')
    } catch (error) {
      console.error('Failed to add embed:', error)
      toast.error('Failed to add embed')
    } finally {
      setSaving(false)
    }
  }

  const toggleEmbed = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('social_embeds')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error

      setEmbeds(embeds.map(e =>
        e.id === id ? { ...e, is_active: !isActive } : e
      ))
      toast.success(isActive ? 'Embed hidden' : 'Embed visible')
    } catch (error) {
      console.error('Failed to toggle embed:', error)
      toast.error('Failed to update embed')
    }
  }

  const deleteEmbed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_embeds')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmbeds(embeds.filter(e => e.id !== id))
      toast.success('Embed deleted!')
    } catch (error) {
      console.error('Failed to delete embed:', error)
      toast.error('Failed to delete embed')
    }
  }

  const getPlatformInfo = (platform: Platform) => {
    return PLATFORMS.find(p => p.value === platform) || PLATFORMS[0]
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[24px] font-bold text-[#F5F5F7] mb-6">Social Embeds</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-[rgba(255,255,255,0.05)] rounded-xl" />
          <div className="h-24 bg-[rgba(255,255,255,0.05)] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#F5F5F7]">Social Embeds</h1>
          <p className="text-sm text-[#86868B] mt-1">
            Add social media content to your profile
          </p>
        </div>
      </div>

      {/* Embed Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#86868B]">
          {embeds.length} / {limits.maxSocialEmbeds === Infinity ? '∞' : limits.maxSocialEmbeds} embeds
        </p>
        {!isPremium && embeds.length >= limits.maxSocialEmbeds && (
          <Button variant="outline" className="text-[#0071E3] border-[#0071E3]">
            Upgrade to Premium
          </Button>
        )}
      </div>

      {/* Existing Embeds */}
      <AnimatePresence>
        {embeds.map((embed) => {
          const platform = getPlatformInfo(embed.platform)
          return (
            <m.div
              key={embed.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] ${!embed.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-[#6E6E73]">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="text-2xl">{platform.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{platform.label}</p>
                      <p className="text-sm text-[#86868B] truncate">{embed.embed_url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => window.open(embed.embed_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleEmbed(embed.id, embed.is_active)}
                      >
                        {embed.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteEmbed(embed.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          )
        })}
      </AnimatePresence>

      {/* Add New Embed */}
      {isAdding ? (
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] border-dashed">
          <CardHeader>
            <CardTitle>Add Social Embed</CardTitle>
            <CardDescription>
              Paste a link from Instagram, TikTok, YouTube, Spotify, or X
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="grid grid-cols-5 gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => setNewPlatform(platform.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      newPlatform === platform.value
                        ? 'border-[#0071E3] bg-[rgba(0,113,227,0.08)]'
                        : 'border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.15)]'
                    }`}
                  >
                    <div className="text-xl mb-1">{platform.icon}</div>
                    <div className="text-xs text-[#86868B]">{platform.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embedUrl">URL</Label>
              <Input
                id="embedUrl"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={getPlatformInfo(newPlatform).placeholder}
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.10)]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addEmbed} disabled={saving}>
                {saving ? 'Adding...' : 'Add Embed'}
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed border-[rgba(255,255,255,0.10)] text-[#86868B] hover:text-[#F5F5F7]"
          onClick={() => setIsAdding(true)}
          disabled={embeds.length >= limits.maxSocialEmbeds}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Social Embed
        </Button>
      )}

      {/* Info Card */}
      <Card className="bg-[rgba(255,255,255,0.03)]/50 border-[rgba(255,255,255,0.06)]">
        <CardContent className="p-4">
          <p className="text-sm text-[#86868B]">
            <strong className="text-[#F5F5F7]">Tip:</strong> Social embeds will appear on your public profile below your links.
            They help visitors engage with your content directly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
