'use client'

import { useState, useEffect, useCallback } from 'react'
import { m, LazyMotion, domAnimation } from 'motion/react'
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
import {
  type Integration,
  type IntegrationProvider,
  INTEGRATION_PROVIDER_LABELS,
  INTEGRATION_PROVIDER_DESCRIPTIONS,
} from '@/lib/types/database'
import { toast } from 'sonner'
import {
  Plug,
  Calendar,
  CreditCard,
  Code,
  Zap,
  Check,
  Settings2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Clock,
  Crown,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  staggerContainerVariants,
  fadeUpVariants,
  transition,
} from '@/lib/motion'

// Provider visual config
const PROVIDER_CONFIG: Record<
  IntegrationProvider,
  {
    icon: typeof Calendar
    color: string        // text color
    bgColor: string      // badge/icon background
    borderColor: string  // card accent border on hover
    gradient: string     // gradient for connected state
  }
> = {
  calendly: {
    icon: Calendar,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    gradient: 'from-emerald-500 to-green-500',
  },
  cal_com: {
    icon: Calendar,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    gradient: 'from-blue-500 to-cyan-500',
  },
  stripe: {
    icon: CreditCard,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    gradient: 'from-purple-500 to-violet-500',
  },
  webhook: {
    icon: Code,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/40',
    gradient: 'from-gray-500 to-zinc-500',
  },
  zapier: {
    icon: Zap,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/40',
    gradient: 'from-orange-500 to-amber-500',
  },
  google_calendar: {
    icon: Calendar,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    gradient: 'from-blue-500 to-sky-500',
  },
  payme: {
    icon: CreditCard,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/40',
    gradient: 'from-green-500 to-emerald-500',
  },
  lemonsqueezy: {
    icon: DollarSign,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/40',
    gradient: 'from-yellow-500 to-amber-500',
  },
}

const ALL_PROVIDERS: IntegrationProvider[] = ['calendly', 'cal_com', 'stripe', 'google_calendar', 'payme', 'lemonsqueezy', 'webhook', 'zapier']

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false)
  const [disconnectConfirmId, setDisconnectConfirmId] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [saving, setSaving] = useState(false)

  // Connect form state
  const [connectName, setConnectName] = useState('')

  // Webhook config form
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  // PayMe config form
  const [paymeSellerId, setPaymeSellerId] = useState('')
  const [paymeApiKey, setPaymeApiKey] = useState('')
  const [paymeTestMode, setPaymeTestMode] = useState(true)

  // LemonSqueezy config form
  const [lemonApiKey, setLemonApiKey] = useState('')
  const [lemonStoreId, setLemonStoreId] = useState('')
  const [lemonTestMode, setLemonTestMode] = useState(true)

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations')
      if (!res.ok) throw new Error('Failed to fetch integrations')
      const data = await res.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
      toast.error('Failed to load integrations')
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
    fetchIntegrations()
    checkPremiumStatus()
  }, [fetchIntegrations, checkPremiumStatus])

  const getConnectedProvider = (provider: IntegrationProvider): Integration | undefined => {
    return integrations.find((i) => i.provider === provider)
  }

  const openConnectDialog = (provider: IntegrationProvider) => {
    setSelectedProvider(provider)
    setConnectName(INTEGRATION_PROVIDER_LABELS[provider])
    setWebhookUrl('')
    setWebhookSecret('')
    setPaymeSellerId('')
    setPaymeApiKey('')
    setPaymeTestMode(true)
    setLemonApiKey('')
    setLemonStoreId('')
    setLemonTestMode(true)
    setConnectDialogOpen(true)
  }

  const openConfigureDialog = (integration: Integration) => {
    setSelectedIntegration(integration)
    const config = integration.config as Record<string, unknown>
    if (integration.provider === 'webhook') {
      setWebhookUrl((config.url as string) || '')
      setWebhookSecret((config.secret as string) || '')
    } else if (integration.provider === 'payme') {
      setPaymeSellerId((config.seller_id as string) || '')
      setPaymeApiKey((config.api_key as string) || '')
      setPaymeTestMode((config.test_mode as boolean) ?? true)
    } else if (integration.provider === 'lemonsqueezy') {
      setLemonApiKey((config.api_key as string) || '')
      setLemonStoreId((config.store_id as string) || '')
      setLemonTestMode((config.test_mode as boolean) ?? true)
    }
    setConfigureDialogOpen(true)
  }

  const handleConnect = async () => {
    if (!selectedProvider || !connectName.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    try {
      const config: Record<string, unknown> = {}

      if (selectedProvider === 'webhook') {
        if (!webhookUrl.trim()) {
          toast.error('Webhook URL is required')
          setSaving(false)
          return
        }
        try {
          new URL(webhookUrl)
        } catch {
          toast.error('Invalid webhook URL')
          setSaving(false)
          return
        }
        config.url = webhookUrl.trim()
        if (webhookSecret.trim()) config.secret = webhookSecret.trim()
        config.events = ['inquiry.created', 'profile.viewed']
        config.method = 'POST'
      }

      if (selectedProvider === 'google_calendar') {
        // Redirect to Google Calendar OAuth flow
        window.location.href = `/api/integrations/google-calendar/callback?redirect_uri=${encodeURIComponent(window.location.href)}`
        setSaving(false)
        return
      }

      if (selectedProvider === 'payme') {
        if (!paymeSellerId.trim()) {
          toast.error('Seller ID is required')
          setSaving(false)
          return
        }
        if (!paymeApiKey.trim()) {
          toast.error('API Key is required')
          setSaving(false)
          return
        }
        config.seller_id = paymeSellerId.trim()
        config.api_key = paymeApiKey.trim()
        config.test_mode = paymeTestMode
      }

      if (selectedProvider === 'lemonsqueezy') {
        if (!lemonApiKey.trim()) {
          toast.error('API Key is required')
          setSaving(false)
          return
        }
        if (!lemonStoreId.trim()) {
          toast.error('Store ID is required')
          setSaving(false)
          return
        }
        config.api_key = lemonApiKey.trim()
        config.store_id = lemonStoreId.trim()
        config.test_mode = lemonTestMode
      }

      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          name: connectName.trim(),
          config,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to connect integration')
      }

      toast.success(`${INTEGRATION_PROVIDER_LABELS[selectedProvider]} connected`)
      setConnectDialogOpen(false)
      fetchIntegrations()
    } catch (error) {
      console.error('Connect error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to connect')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateConfig = async () => {
    if (!selectedIntegration) return

    setSaving(true)
    try {
      const config: Record<string, unknown> = { ...selectedIntegration.config }

      if (selectedIntegration.provider === 'webhook') {
        if (!webhookUrl.trim()) {
          toast.error('Webhook URL is required')
          setSaving(false)
          return
        }
        config.url = webhookUrl.trim()
        config.secret = webhookSecret.trim() || undefined
      }

      if (selectedIntegration.provider === 'payme') {
        if (!paymeSellerId.trim()) {
          toast.error('Seller ID is required')
          setSaving(false)
          return
        }
        if (!paymeApiKey.trim()) {
          toast.error('API Key is required')
          setSaving(false)
          return
        }
        config.seller_id = paymeSellerId.trim()
        config.api_key = paymeApiKey.trim()
        config.test_mode = paymeTestMode
      }

      if (selectedIntegration.provider === 'lemonsqueezy') {
        if (!lemonApiKey.trim()) {
          toast.error('API Key is required')
          setSaving(false)
          return
        }
        if (!lemonStoreId.trim()) {
          toast.error('Store ID is required')
          setSaving(false)
          return
        }
        config.api_key = lemonApiKey.trim()
        config.store_id = lemonStoreId.trim()
        config.test_mode = lemonTestMode
      }

      const res = await fetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIntegration.id,
          config,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success('Integration updated')
      setConfigureDialogOpen(false)
      fetchIntegrations()
    } catch {
      toast.error('Failed to update integration')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (integration: Integration) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: integration.id, is_active: !integration.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integration.id ? { ...i, is_active: !i.is_active } : i))
      )
      toast.success(integration.is_active ? 'Integration paused' : 'Integration activated')
    } catch {
      toast.error('Failed to update integration')
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to disconnect')
      toast.success('Integration disconnected')
      setDisconnectConfirmId(null)
      fetchIntegrations()
    } catch {
      toast.error('Failed to disconnect integration')
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Integrations</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20">
            <Plug className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Integrations</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Connect external services to supercharge your profile
            </p>
          </div>
        </div>

        {/* Premium Gate */}
        {isPremium === false && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition.enter}
            className="relative overflow-hidden bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 shrink-0">
                <Crown className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Upgrade to Pro for Integrations
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect Calendly, Stripe, webhooks, and more to your profile.
                  Pro users can connect up to 10 integrations to automate their workflow.
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </m.div>
        )}

        {/* Provider Grid */}
        <m.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {ALL_PROVIDERS.map((provider) => {
            const config = PROVIDER_CONFIG[provider]
            const Icon = config.icon
            const connected = getConnectedProvider(provider)

            return (
              <m.div
                key={provider}
                variants={fadeUpVariants}
                transition={transition.enter}
                className={cn(
                  'group relative bg-gray-900 border rounded-xl p-5 transition-all duration-200',
                  connected
                    ? `border-gray-700 hover:${config.borderColor}`
                    : 'border-gray-800 hover:border-gray-700',
                  isPremium === false && 'opacity-60 pointer-events-none'
                )}
              >
                {/* Provider Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg', config.bgColor)}>
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  {connected && (
                    <div className="flex items-center gap-1.5">
                      {connected.is_active ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                          Paused
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Provider Info */}
                <h3 className="text-base font-semibold text-white mb-1">
                  {INTEGRATION_PROVIDER_LABELS[provider]}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {INTEGRATION_PROVIDER_DESCRIPTIONS[provider]}
                </p>

                {/* Connected Meta */}
                {connected && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Last synced: {formatDate(connected.last_synced_at)}</span>
                  </div>
                )}

                {/* Actions */}
                {connected ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfigureDialog(connected)}
                      className="flex-1 border-gray-700 text-gray-300 hover:text-white"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggleActive(connected)}
                      title={connected.is_active ? 'Pause' : 'Resume'}
                    >
                      {connected.is_active ? (
                        <ToggleRight className={cn('h-5 w-5', config.color)} />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => setDisconnectConfirmId(connected.id)}
                      title="Disconnect"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => openConnectDialog(provider)}
                    size="sm"
                    className={cn(
                      'w-full text-white',
                      `bg-gradient-to-r ${config.gradient} hover:opacity-90`
                    )}
                    disabled={isPremium === false}
                  >
                    <Plug className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                )}
              </m.div>
            )
          })}
        </m.div>

        {/* Connected Integrations Summary */}
        {isPremium && integrations.length > 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>
                  {integrations.filter((i) => i.is_active).length} of {integrations.length} integrations active
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {integrations.length} / 10 slots used
              </span>
            </div>
          </m.div>
        )}

        {/* Empty state for premium users with no integrations */}
        {isPremium && integrations.length === 0 && (
          <div className="pt-2">
            <EmptyState
              icon={Plug}
              title="No integrations connected"
              description="Pick a provider above to start connecting external services to your profile."
            />
          </div>
        )}

        {/* Connect Dialog */}
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedProvider && (
                  <>
                    {(() => {
                      const cfg = PROVIDER_CONFIG[selectedProvider]
                      const ProvIcon = cfg.icon
                      return (
                        <div className={cn('flex items-center justify-center w-7 h-7 rounded-md', cfg.bgColor)}>
                          <ProvIcon className={cn('h-4 w-4', cfg.color)} />
                        </div>
                      )
                    })()}
                    Connect {INTEGRATION_PROVIDER_LABELS[selectedProvider]}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedProvider === 'webhook'
                  ? 'Configure a webhook endpoint to receive real-time events from your profile.'
                  : selectedProvider === 'zapier'
                    ? 'Connect your Zapier account to automate workflows with 5000+ apps.'
                    : `Set up your ${selectedProvider ? INTEGRATION_PROVIDER_LABELS[selectedProvider] : ''} integration.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Integration Name */}
              <div className="space-y-2">
                <Label htmlFor="connect-name">Display Name</Label>
                <Input
                  id="connect-name"
                  value={connectName}
                  onChange={(e) => setConnectName(e.target.value)}
                  placeholder="e.g. My Calendly"
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              {/* Webhook-specific fields */}
              {selectedProvider === 'webhook' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Endpoint URL</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://example.com/webhooks/linkhub"
                      className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-500">
                      We will send POST requests to this URL when events occur.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Signing Secret (optional)</Label>
                    <Input
                      id="webhook-secret"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="whsec_..."
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Used to sign payloads with HMAC-SHA256 so you can verify authenticity.
                    </p>
                  </div>
                </>
              )}

              {/* PayMe-specific fields */}
              {selectedProvider === 'payme' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="payme-seller-id">Seller ID</Label>
                    <Input
                      id="payme-seller-id"
                      value={paymeSellerId}
                      onChange={(e) => setPaymeSellerId(e.target.value)}
                      placeholder="e.g. MPL12345-67890ABC"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Your PayMe seller ID from the merchant dashboard.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payme-api-key">API Key</Label>
                    <Input
                      id="payme-api-key"
                      type="password"
                      value={paymeApiKey}
                      onChange={(e) => setPaymeApiKey(e.target.value)}
                      placeholder="Enter your PayMe API key"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <Label className="text-sm">Test Mode</Label>
                      <p className="text-xs text-gray-500 mt-0.5">Use sandbox environment for testing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymeTestMode(!paymeTestMode)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      {paymeTestMode ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* LemonSqueezy-specific fields */}
              {selectedProvider === 'lemonsqueezy' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lemon-api-key">API Key</Label>
                    <Input
                      id="lemon-api-key"
                      type="password"
                      value={lemonApiKey}
                      onChange={(e) => setLemonApiKey(e.target.value)}
                      placeholder="Enter your LemonSqueezy API key"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Generate an API key in your LemonSqueezy dashboard under Settings &gt; API.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lemon-store-id">Store ID</Label>
                    <Input
                      id="lemon-store-id"
                      value={lemonStoreId}
                      onChange={(e) => setLemonStoreId(e.target.value)}
                      placeholder="e.g. 12345"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Found in your store settings URL: app.lemonsqueezy.com/settings/stores/[ID]
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <Label className="text-sm">Test Mode</Label>
                      <p className="text-xs text-gray-500 mt-0.5">Use sandbox environment for testing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLemonTestMode(!lemonTestMode)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      {lemonTestMode ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Google Calendar OAuth info banner */}
              {selectedProvider === 'google_calendar' && (
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    Clicking Connect will redirect you to Google to authorize access to your calendar.
                    We only request read access to check your availability.
                  </p>
                </div>
              )}

              {/* OAuth providers - info banner */}
              {selectedProvider && !['webhook', 'zapier', 'payme', 'lemonsqueezy', 'google_calendar'].includes(selectedProvider) && (
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <ExternalLink className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    After saving, you will be redirected to {INTEGRATION_PROVIDER_LABELS[selectedProvider]} to authorize the connection. Your data stays secure.
                  </p>
                </div>
              )}

              {/* Zapier info */}
              {selectedProvider === 'zapier' && (
                <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-300">
                    A webhook URL will be generated for you to use in your Zapier zaps. Copy it after connecting.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={saving}
                className={cn(
                  'text-white',
                  selectedProvider
                    ? `bg-gradient-to-r ${PROVIDER_CONFIG[selectedProvider].gradient} hover:opacity-90`
                    : ''
                )}
              >
                {saving ? 'Connecting...' : 'Connect'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configure Dialog */}
        <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Configure {selectedIntegration ? INTEGRATION_PROVIDER_LABELS[selectedIntegration.provider] : ''}
              </DialogTitle>
              <DialogDescription>
                Update the settings for this integration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {selectedIntegration?.provider === 'webhook' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="config-webhook-url">Endpoint URL</Label>
                    <Input
                      id="config-webhook-url"
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://example.com/webhooks/linkhub"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-webhook-secret">Signing Secret</Label>
                    <Input
                      id="config-webhook-secret"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="whsec_..."
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                  </div>
                </>
              )}

              {selectedIntegration?.provider === 'payme' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="config-payme-seller-id">Seller ID</Label>
                    <Input
                      id="config-payme-seller-id"
                      value={paymeSellerId}
                      onChange={(e) => setPaymeSellerId(e.target.value)}
                      placeholder="e.g. MPL12345-67890ABC"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-payme-api-key">API Key</Label>
                    <Input
                      id="config-payme-api-key"
                      type="password"
                      value={paymeApiKey}
                      onChange={(e) => setPaymeApiKey(e.target.value)}
                      placeholder="Enter your PayMe API key"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <Label className="text-sm">Test Mode</Label>
                      <p className="text-xs text-gray-500 mt-0.5">Use sandbox environment for testing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymeTestMode(!paymeTestMode)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      {paymeTestMode ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {selectedIntegration?.provider === 'lemonsqueezy' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="config-lemon-api-key">API Key</Label>
                    <Input
                      id="config-lemon-api-key"
                      type="password"
                      value={lemonApiKey}
                      onChange={(e) => setLemonApiKey(e.target.value)}
                      placeholder="Enter your LemonSqueezy API key"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-lemon-store-id">Store ID</Label>
                    <Input
                      id="config-lemon-store-id"
                      value={lemonStoreId}
                      onChange={(e) => setLemonStoreId(e.target.value)}
                      placeholder="e.g. 12345"
                      className="bg-gray-800 border-gray-700 font-mono text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div>
                      <Label className="text-sm">Test Mode</Label>
                      <p className="text-xs text-gray-500 mt-0.5">Use sandbox environment for testing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLemonTestMode(!lemonTestMode)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      {lemonTestMode ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-500" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {selectedIntegration && !['webhook', 'payme', 'lemonsqueezy'].includes(selectedIntegration.provider) && (
                <div className="text-center py-6">
                  <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3',
                    PROVIDER_CONFIG[selectedIntegration.provider].bgColor
                  )}>
                    {(() => {
                      const cfg = PROVIDER_CONFIG[selectedIntegration.provider]
                      const ProvIcon = cfg.icon
                      return <ProvIcon className={cn('h-6 w-6', cfg.color)} />
                    })()}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {INTEGRATION_PROVIDER_LABELS[selectedIntegration.provider]} is connected and active.
                    OAuth configuration is managed through the provider.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Connected on {formatDate(selectedIntegration.connected_at)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigureDialogOpen(false)}>
                {selectedIntegration && ['webhook', 'payme', 'lemonsqueezy'].includes(selectedIntegration.provider) ? 'Cancel' : 'Close'}
              </Button>
              {selectedIntegration && ['webhook', 'payme', 'lemonsqueezy'].includes(selectedIntegration.provider) && (
                <Button
                  onClick={handleUpdateConfig}
                  disabled={saving}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disconnect Confirmation Dialog */}
        <Dialog open={!!disconnectConfirmId} onOpenChange={() => setDisconnectConfirmId(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Disconnect Integration</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect this integration? Any automations
                or webhooks using this connection will stop working immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisconnectConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => disconnectConfirmId && handleDisconnect(disconnectConfirmId)}
              >
                Disconnect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LazyMotion>
  )
}
