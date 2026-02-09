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
import {
  type Service,
  type ServiceCategory,
  type ServicePricing,
  type ServiceActionType,
  SERVICE_CATEGORY_LABELS,
  SERVICE_PRICING_LABELS,
  SERVICE_ACTION_LABELS,
  formatPrice,
} from '@/lib/types/database'
import { toast } from 'sonner'
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  MessageSquare,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

interface ServiceWithInquiries extends Service {
  inquiry_count?: number
}

interface ServiceFormData {
  title: string
  description: string
  category: ServiceCategory
  pricing: ServicePricing
  price_amount: string
  price_currency: string
  action_type: ServiceActionType
  external_url: string
}

const defaultFormData: ServiceFormData = {
  title: '',
  description: '',
  category: 'consulting',
  pricing: 'contact',
  price_amount: '',
  price_currency: 'USD',
  action_type: 'contact_form',
  external_url: '',
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithInquiries[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithInquiries | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services')
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const openCreateDialog = () => {
    setEditingService(null)
    setFormData(defaultFormData)
    setDialogOpen(true)
  }

  const openEditDialog = (service: ServiceWithInquiries) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description || '',
      category: service.category,
      pricing: service.pricing,
      price_amount: service.price_amount != null ? String(service.price_amount) : '',
      price_currency: service.price_currency || 'USD',
      action_type: service.action_type,
      external_url: (service.action_config as Record<string, string>)?.url || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        pricing: formData.pricing,
        price_amount:
          (formData.pricing === 'fixed' || formData.pricing === 'hourly') && formData.price_amount
            ? Number(formData.price_amount)
            : null,
        price_currency: formData.price_currency,
        action_type: formData.action_type,
        action_config:
          formData.action_type === 'external_link' && formData.external_url
            ? { url: formData.external_url }
            : {},
      }

      let res: Response
      if (editingService) {
        res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save service')
      }

      toast.success(editingService ? 'Service updated' : 'Service created')
      setDialogOpen(false)
      fetchServices()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Service deleted')
      setDeleteConfirmId(null)
      fetchServices()
    } catch {
      toast.error('Failed to delete service')
    }
  }

  const handleToggleActive = async (service: ServiceWithInquiries) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !service.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      )
    } catch {
      toast.error('Failed to update service')
    }
  }

  const showPriceInput = formData.pricing === 'fixed' || formData.pricing === 'hourly'
  const showExternalUrl = formData.action_type === 'external_link'

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[24px] font-bold text-[#F5F5F7] mb-6">Services</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--lh-surface-3)] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#F5F5F7]">Services</h1>
          <p className="text-[13px] text-[#86868B] mt-1">
            Offer services on your profile for visitors and AI agents to discover
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services yet"
          description="Create your first service to showcase what you offer. Services appear on your public profile."
          actionLabel="Create Your First Service"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`relative bg-[rgba(255,255,255,0.03)] border rounded-xl p-5 transition-all duration-200 ${
                service.is_active
                  ? 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
                  : 'border-[rgba(255,255,255,0.04)] opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold text-[#F5F5F7] truncate">{service.title}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(0,113,227,0.1)] text-[#0071E3]">
                      {SERVICE_CATEGORY_LABELS[service.category]}
                    </span>
                    {!service.is_active && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(255,255,255,0.06)] text-[#6E6E73]">
                        Inactive
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-[13px] text-[#86868B] mt-1 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-[12px]">
                    <span className="text-[#F5F5F7]">
                      {formatPrice(service.pricing, service.price_amount, service.price_currency)}
                    </span>
                    <span className="text-[#48484A]">|</span>
                    <span className="text-[#86868B] flex items-center gap-1">
                      {service.action_type === 'external_link' && (
                        <ExternalLink className="h-3 w-3" />
                      )}
                      {SERVICE_ACTION_LABELS[service.action_type]}
                    </span>
                    {(service.inquiry_count ?? 0) > 0 && (
                      <>
                        <span className="text-[#48484A]">|</span>
                        <span className="text-[#86868B] flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {service.inquiry_count} {service.inquiry_count === 1 ? 'inquiry' : 'inquiries'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleActive(service)}
                    title={service.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {service.is_active ? (
                      <ToggleRight className="h-5 w-5 text-[#0071E3]" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-[#6E6E73]" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditDialog(service)}
                    title="Edit"
                    className="text-[#86868B] hover:text-[#F5F5F7]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-[#FF453A] hover:text-[#FF453A] hover:bg-[rgba(255,69,58,0.1)]"
                    onClick={() => setDeleteConfirmId(service.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[var(--lh-surface-3)] border-[rgba(255,255,255,0.08)] text-[#F5F5F7] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update your service details.'
                : 'Add a new service to your profile.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Web Development Consultation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe what this service includes..."
                className="w-full h-20 px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[10px] text-[14px] text-[#F5F5F7] placeholder:text-[#6E6E73] resize-none focus:outline-none focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.2)] transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as ServiceCategory,
                    }))
                  }
                  className="w-full h-10 px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[10px] text-[14px] text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.2)] transition-all duration-200"
                >
                  {Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing</Label>
                <select
                  id="pricing"
                  value={formData.pricing}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: e.target.value as ServicePricing,
                    }))
                  }
                  className="w-full h-10 px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[10px] text-[14px] text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.2)] transition-all duration-200"
                >
                  {Object.entries(SERVICE_PRICING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showPriceInput && (
              <div className="space-y-2">
                <Label htmlFor="price_amount">
                  {formData.pricing === 'hourly' ? 'Hourly Rate' : 'Price'}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#86868B]">$</span>
                  <Input
                    id="price_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price_amount: e.target.value }))
                    }
                    placeholder="0.00"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="action_type">Action Button</Label>
              <select
                id="action_type"
                value={formData.action_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    action_type: e.target.value as ServiceActionType,
                  }))
                }
                className="w-full h-10 px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] rounded-[10px] text-[14px] text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] focus:ring-[3px] focus:ring-[rgba(0,113,227,0.2)] transition-all duration-200"
              >
                {Object.entries(SERVICE_ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {showExternalUrl && (
              <div className="space-y-2">
                <Label htmlFor="external_url">External URL</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, external_url: e.target.value }))
                  }
                  placeholder="https://example.com/book"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingService ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-[var(--lh-surface-3)] border-[rgba(255,255,255,0.08)] text-[#F5F5F7] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
