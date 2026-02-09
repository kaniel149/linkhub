'use client'

import { useState, useCallback } from 'react'
import { Link, getPlanLimits } from '@/lib/types/database'
import { LinkCard } from './link-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'

interface LinksManagerProps {
  initialLinks: Link[]
  profileId: string
  isPremium: boolean
}

export function LinksManager({ initialLinks, profileId, isPremium }: LinksManagerProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const limits = getPlanLimits(isPremium)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeLink = activeId ? links.find((l) => l.id === activeId) : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((l) => l.id === active.id)
    const newIndex = links.findIndex((l) => l.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Optimistic update
    const reordered = arrayMove(links, oldIndex, newIndex)
    setLinks(reordered)

    // Persist new positions to Supabase
    try {
      const updates = reordered.map((link, index) => ({
        id: link.id,
        position: index,
      }))

      const res = await fetch('/api/links/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!res.ok) throw new Error('Failed to save order')
    } catch {
      // Revert on failure
      setLinks(links)
      toast.error('Failed to save link order')
    }
  }, [links])

  const addLink = async () => {
    if (!newTitle || !newUrl) {
      toast.error('Please fill in both title and URL')
      return
    }

    if (links.length >= limits.maxLinks) {
      toast.error(`Free plan limited to ${limits.maxLinks} links. Upgrade to Premium!`)
      return
    }

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl,
          position: links.length,
        }),
      })

      if (!res.ok) throw new Error('Failed to create link')

      const newLink = await res.json()
      setLinks([...links, newLink])
      setNewTitle('')
      setNewUrl('')
      setIsAdding(false)
      toast.success('Link added!')
    } catch {
      toast.error('Failed to add link')
    }
  }

  const updateLink = async (id: string, data: Partial<Link>) => {
    try {
      const res = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })

      if (!res.ok) throw new Error('Failed to update link')

      const updatedLink = await res.json()
      setLinks(links.map((l) => (l.id === id ? updatedLink : l)))
      toast.success('Link updated!')
    } catch {
      toast.error('Failed to update link')
    }
  }

  const deleteLink = async (id: string) => {
    try {
      const res = await fetch('/api/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error('Failed to delete link')

      setLinks(links.filter((l) => l.id !== id))
      toast.success('Link deleted!')
    } catch {
      toast.error('Failed to delete link')
    }
  }

  return (
    <div className="space-y-3">
      {/* Link count and upgrade */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#6E6E73]">
          {links.length} / {limits.maxLinks === Infinity ? '\u221E' : limits.maxLinks} links
        </p>
        {!isPremium && links.length >= limits.maxLinks && (
          <Button variant="outline" size="sm">
            Upgrade to Pro
          </Button>
        )}
      </div>

      {/* Links list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onUpdate={updateLink}
                onDelete={deleteLink}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        <DragOverlay>
          {activeLink ? (
            <Card className="bg-[var(--lh-surface-3)] border-[rgba(0,113,227,0.3)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] opacity-95">
              <div className="flex items-center gap-3">
                <div className="text-[rgba(255,255,255,0.15)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <div className="text-2xl flex-shrink-0">{activeLink.icon || '\uD83D\uDD17'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F5F5F7] truncate">{activeLink.title}</p>
                  <p className="text-[12px] text-[#6E6E73] truncate">{activeLink.url}</p>
                </div>
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {links.length === 0 && !isAdding && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(0,113,227,0.1)] mb-4">
            <Link2 className="h-6 w-6 text-[#0071E3]" />
          </div>
          <h3 className="text-[17px] font-semibold text-[#F5F5F7] mb-1">Add your first link</h3>
          <p className="text-[14px] text-[#86868B] mb-5 max-w-xs">
            Share your important links with the world. Add websites, social profiles, and more.
          </p>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      )}

      {/* Add link form */}
      {isAdding ? (
        <Card className="bg-[rgba(255,255,255,0.03)] border-dashed border-[rgba(255,255,255,0.10)] p-4 space-y-3">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Link title"
          />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
          />
          <div className="flex gap-2">
            <Button onClick={addLink}>Add Link</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : links.length > 0 ? (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setIsAdding(true)}
          disabled={links.length >= limits.maxLinks}
        >
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      ) : null}
    </div>
  )
}
