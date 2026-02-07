'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Theme } from '@/lib/types/database'
import { toast } from 'sonner'
import { Palette, Check } from 'lucide-react'

const PRESET_COLORS = [
  { name: 'Purple', primary: '#8b5cf6', background: '#0f0f23' },
  { name: 'Pink', primary: '#ec4899', background: '#1a0a14' },
  { name: 'Blue', primary: '#3b82f6', background: '#0a1628' },
  { name: 'Green', primary: '#22c55e', background: '#0a1f0a' },
  { name: 'Orange', primary: '#f97316', background: '#1f1408' },
  { name: 'Red', primary: '#ef4444', background: '#1f0a0a' },
  { name: 'Cyan', primary: '#06b6d4', background: '#0a1a1f' },
  { name: 'Yellow', primary: '#eab308', background: '#1f1a08' },
]

const BUTTON_STYLES: { value: Theme['buttonStyle']; label: string; preview: string }[] = [
  { value: 'solid', label: 'Solid', preview: 'bg-purple-500 text-white' },
  { value: 'outline', label: 'Outline', preview: 'border-2 border-purple-500 text-purple-500 bg-transparent' },
  { value: 'glass', label: 'Glass', preview: 'bg-white/10 backdrop-blur text-white border border-white/20' },
  { value: 'soft', label: 'Soft', preview: 'bg-purple-500/20 text-purple-400' },
]

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Default)' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
]

export default function AppearancePage() {
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#8b5cf6',
    backgroundColor: '#0f0f23',
    buttonStyle: 'solid',
    fontFamily: 'Inter',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (profile?.theme) {
        setTheme(profile.theme)
      }
    } catch (error) {
      console.error('Failed to load theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTheme = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({ theme, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Theme saved successfully!')
    } catch (error) {
      console.error('Failed to save theme:', error)
      toast.error('Failed to save theme')
    } finally {
      setSaving(false)
    }
  }

  const applyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setTheme(prev => ({
      ...prev,
      primaryColor: preset.primary,
      backgroundColor: preset.background,
    }))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Appearance</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-800 rounded-xl" />
          <div className="h-40 bg-gray-800 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appearance</h1>
        <Button onClick={saveTheme} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Live Preview */}
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="p-8 min-h-[200px] flex flex-col items-center justify-center gap-4"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <p className="text-white font-semibold" style={{ fontFamily: theme.fontFamily }}>
              Your Name
            </p>
            <div className="w-full max-w-xs space-y-2">
              {['My Website', 'Follow Me'].map((text) => (
                <button
                  key={text}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    theme.buttonStyle === 'solid'
                      ? 'text-white'
                      : theme.buttonStyle === 'outline'
                      ? 'bg-transparent border-2'
                      : theme.buttonStyle === 'glass'
                      ? 'bg-white/10 backdrop-blur border border-white/20 text-white'
                      : 'text-white'
                  }`}
                  style={{
                    backgroundColor:
                      theme.buttonStyle === 'solid'
                        ? theme.primaryColor
                        : theme.buttonStyle === 'soft'
                        ? `${theme.primaryColor}33`
                        : 'transparent',
                    borderColor:
                      theme.buttonStyle === 'outline' ? theme.primaryColor : undefined,
                    color:
                      theme.buttonStyle === 'outline' || theme.buttonStyle === 'soft'
                        ? theme.primaryColor
                        : 'white',
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Presets */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Color Presets</CardTitle>
          <CardDescription>Choose a preset or customize below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="relative group flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-gray-600"
                    style={{ backgroundColor: preset.background }}
                  />
                </div>
                <span className="text-xs text-gray-400">{preset.name}</span>
                {theme.primaryColor === preset.primary && (
                  <Check className="absolute top-1 right-1 h-4 w-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Custom Colors</CardTitle>
          <CardDescription>Fine-tune your colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={theme.primaryColor}
                  onChange={(e) =>
                    setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="bg-gray-800 border-gray-700 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) =>
                    setTheme((prev) => ({ ...prev, backgroundColor: e.target.value }))
                  }
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={theme.backgroundColor}
                  onChange={(e) =>
                    setTheme((prev) => ({ ...prev, backgroundColor: e.target.value }))
                  }
                  className="bg-gray-800 border-gray-700 flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Style */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Button Style</CardTitle>
          <CardDescription>Choose how your link buttons look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {BUTTON_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => setTheme((prev) => ({ ...prev, buttonStyle: style.value }))}
                className={`p-4 rounded-lg border transition-all ${
                  theme.buttonStyle === style.value
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium text-center ${style.preview}`}
                >
                  {style.label}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Selection */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Font Family</CardTitle>
          <CardDescription>Choose your profile font</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                onClick={() => setTheme((prev) => ({ ...prev, fontFamily: font.value }))}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  theme.fontFamily === font.value
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                style={{ fontFamily: font.value }}
              >
                <span className="text-sm">{font.label}</span>
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: font.value }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
