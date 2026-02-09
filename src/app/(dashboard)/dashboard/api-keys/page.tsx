'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { type ApiKeyDisplay, type ApiKeyPermission } from '@/lib/types/database'
import { toast } from 'sonner'
import {
  Key,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Clock,
  Zap,
} from 'lucide-react'

const PERMISSION_LABELS: Record<ApiKeyPermission, { label: string; description: string }> = {
  read: { label: 'Read', description: 'Read profile, links, and services' },
  write: { label: 'Write', description: 'Create and update links and services' },
  inquire: { label: 'Inquire', description: 'Submit service inquiries' },
}

const RATE_LIMIT_OPTIONS = [
  { value: 50, label: '50 req/hr' },
  { value: 100, label: '100 req/hr' },
  { value: 500, label: '500 req/hr' },
  { value: 1000, label: '1,000 req/hr' },
]

const PERMISSION_COLORS: Record<ApiKeyPermission, string> = {
  read: 'bg-cyan-500/20 text-cyan-400',
  write: 'bg-amber-500/20 text-amber-400',
  inquire: 'bg-purple-500/20 text-purple-400',
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [revealDialogOpen, setRevealDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form state
  const [keyName, setKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<ApiKeyPermission[]>(['read'])
  const [selectedRateLimit, setSelectedRateLimit] = useState(100)

  // Revealed key (shown only once)
  const [revealedKey, setRevealedKey] = useState('')

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/api-keys')
      if (!res.ok) throw new Error('Failed to fetch API keys')
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  const checkPremiumStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles')
      if (!res.ok) return
      const data = await res.json()
      setIsPremium(data.profile?.is_premium ?? false)
    } catch {
      setIsPremium(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
    checkPremiumStatus()
  }, [fetchKeys, checkPremiumStatus])

  const openCreateDialog = () => {
    setKeyName('')
    setSelectedPermissions(['read'])
    setSelectedRateLimit(100)
    setCreateDialogOpen(true)
  }

  const togglePermission = (perm: ApiKeyPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const handleCreate = async () => {
    if (!keyName.trim()) {
      toast.error('Key name is required')
      return
    }
    if (selectedPermissions.length === 0) {
      toast.error('Select at least one permission')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName.trim(),
          permissions: selectedPermissions,
          rate_limit: selectedRateLimit,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create API key')
      }

      const data = await res.json()
      setRevealedKey(data.full_key)
      setCreateDialogOpen(false)
      setRevealDialogOpen(true)
      fetchKeys()
      toast.success('API key created')
    } catch (error) {
      console.error('Create error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create API key')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (key: ApiKeyDisplay) => {
    try {
      const res = await fetch('/api/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key.id, is_active: !key.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setKeys((prev) =>
        prev.map((k) => (k.id === key.id ? { ...k, is_active: !k.is_active } : k))
      )
      toast.success(key.is_active ? 'Key deactivated' : 'Key activated')
    } catch {
      toast.error('Failed to update API key')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('API key deleted')
      setDeleteConfirmId(null)
      fetchKeys()
    } catch {
      toast.error('Failed to delete API key')
    }
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(revealedKey)
      setCopied(true)
      toast.success('API key copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy key')
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    return formatDate(dateStr)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[24px] font-bold mb-6">API Keys</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[rgba(255,255,255,0.05)] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/20">
            <Key className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-[#F5F5F7]">API Keys</h1>
            <p className="text-[#86868B] text-sm mt-0.5">
              Manage API keys for MCP agent access
            </p>
          </div>
        </div>
        {isPremium ? (
          <Button onClick={openCreateDialog} className="bg-cyan-600 hover:bg-cyan-700 text-[#F5F5F7]">
            <Plus className="h-4 w-4" />
            Create Key
          </Button>
        ) : null}
      </div>

      {/* Premium Gate */}
      {isPremium === false && (
        <div className="relative overflow-hidden bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,113,227,0.05)] to-[rgba(0,163,255,0.05)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 shrink-0">
              <Zap className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#F5F5F7] mb-1">
                Upgrade to Pro for API Access
              </h3>
              <p className="text-[#86868B] text-sm mb-4">
                API keys allow AI agents and MCP clients to interact with your profile programmatically.
                Create up to 5 keys with granular permissions and rate limits.
              </p>
              <Button className="bg-gradient-to-r from-[#0071E3] to-[#00A3FF] hover:brightness-110 text-[#F5F5F7]">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      {isPremium && keys.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No API keys yet"
          description="Create one to enable MCP access for AI agents."
          actionLabel="Create Your First API Key"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`relative bg-[rgba(255,255,255,0.03)] border rounded-xl p-5 transition-colors ${
                key.is_active ? 'border-[rgba(255,255,255,0.06)]' : 'border-[rgba(255,255,255,0.06)]/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Key name and prefix */}
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="h-4 w-4 text-cyan-400 shrink-0" />
                    <h3 className="text-base font-semibold text-[#F5F5F7] truncate">{key.name}</h3>
                    <code className="text-xs font-mono text-[#6E6E73] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded shrink-0">
                      {key.key_prefix}
                    </code>
                    {!key.is_active && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.06)] text-[#86868B]">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Permissions badges */}
                  <div className="flex items-center gap-2 mb-3">
                    {key.permissions.map((perm) => (
                      <span
                        key={perm}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PERMISSION_COLORS[perm]}`}
                      >
                        {PERMISSION_LABELS[perm].label}
                      </span>
                    ))}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-[#6E6E73]">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {key.rate_limit} req/hr
                    </span>
                    <span className="text-[#48484A]">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last used: {formatDate(key.last_used_at)}
                    </span>
                    <span className="text-[#48484A]">|</span>
                    <span>Created {formatRelativeDate(key.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleActive(key)}
                    title={key.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {key.is_active ? (
                      <ToggleRight className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-[#6E6E73]" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => setDeleteConfirmId(key.id)}
                    title="Revoke key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] text-[#F5F5F7] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for MCP agent access to your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Key Name */}
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. My MCP Agent, Claude Desktop"
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.10)]"
              />
              <p className="text-xs text-[#6E6E73]">
                A descriptive name to identify this key
              </p>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                {(Object.entries(PERMISSION_LABELS) as [ApiKeyPermission, { label: string; description: string }][]).map(
                  ([perm, { label, description }]) => (
                    <label
                      key={perm}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPermissions.includes(perm)
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)]/50 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-[rgba(255,255,255,0.05)] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <div>
                        <div className="text-sm font-medium text-[#F5F5F7]">{label}</div>
                        <div className="text-xs text-[#86868B]">{description}</div>
                      </div>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Rate Limit */}
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit</Label>
              <select
                id="rate-limit"
                value={selectedRateLimit}
                onChange={(e) => setSelectedRateLimit(Number(e.target.value))}
                className="w-full h-9 px-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-md text-sm text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {RATE_LIMIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#6E6E73]">
                Maximum number of API requests per hour
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 text-[#F5F5F7]"
            >
              {saving ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal Key Dialog */}
      <Dialog
        open={revealDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRevealedKey('')
            setCopied(false)
          }
          setRevealDialogOpen(open)
        }}
      >
        <DialogContent className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] text-[#F5F5F7] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Save Your API Key
            </DialogTitle>
            <DialogDescription>
              This is the only time your full API key will be shown. Copy it now and store it securely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Warning banner */}
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                This key won&apos;t be shown again. If you lose it, you&apos;ll need to create a new one.
              </p>
            </div>

            {/* Key display */}
            <div className="relative">
              <code className="block w-full p-3 pr-12 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-lg text-sm font-mono text-cyan-400 break-all select-all">
                {revealedKey}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={handleCopyKey}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-[#86868B]" />
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCopyKey}
              className="bg-cyan-600 hover:bg-cyan-700 text-[#F5F5F7] w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] text-[#F5F5F7] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? Any agents or services using this key
              will immediately lose access. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
