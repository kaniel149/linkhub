'use client'

import { Link } from '@/lib/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { GripVertical, Trash2, ExternalLink, Check, X, BarChart2 } from 'lucide-react'
import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { spring, fadeUpVariants } from '@/lib/motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface LinkCardProps {
  link: Link
  onUpdate: (id: string, data: Partial<Link>) => void
  onDelete: (id: string) => void
}

export function LinkCard({
  link,
  onUpdate,
  onDelete,
}: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
  }

  const handleSave = () => {
    if (title.trim() && url.trim()) {
      onUpdate(link.id, { title: title.trim(), url: url.trim() })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setTitle(link.title)
    setUrl(link.url)
    setIsEditing(false)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(link.id)
    }, 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <m.div
      ref={setNodeRef}
      style={style}
      layout
      variants={fadeUpVariants}
      initial="hidden"
      animate={isDeleting ? { opacity: 0, x: -100, scale: 0.95 } : "visible"}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={spring.default}
    >
      <Card
        className={cn(
          'bg-zinc-900 border-zinc-800 p-4 transition-all',
          !link.is_active && 'opacity-60',
          isEditing && 'ring-2 ring-purple-500/50',
          isDragging && 'shadow-2xl shadow-black/40 scale-[1.03] ring-2 ring-purple-500/30',
          !isDragging && 'shadow-sm'
        )}
      >
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          {!isEditing && (
            <div
              className={cn(
                "touch-none text-zinc-600 hover:text-zinc-400 transition-colors",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          {/* Icon */}
          <m.div
            className="text-2xl flex-shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.bouncy}
          >
            {link.icon || '🔗'}
          </m.div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <m.div
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Link title"
                    className="bg-zinc-800 border-zinc-700 focus:border-purple-500"
                    autoFocus
                  />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://..."
                    className="bg-zinc-800 border-zinc-700 focus:border-purple-500"
                  />
                </m.div>
              ) : (
                <m.div
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p
                    className={cn(
                      'font-medium text-white truncate',
                      !link.is_active && 'line-through text-zinc-500'
                    )}
                  >
                    {link.title}
                  </p>
                  <p className="text-sm text-zinc-500 truncate">{link.url}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Click count */}
            <m.div
              className="flex items-center gap-1 text-sm text-zinc-500 px-2"
              whileHover={{ scale: 1.05 }}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>{link.click_count}</span>
            </m.div>

            {/* Toggle visibility */}
            <Toggle
              checked={link.is_active}
              onChange={(checked) => onUpdate(link.id, { is_active: checked })}
              size="sm"
              label={link.is_active ? 'Visible' : 'Hidden'}
            />

            {/* Edit/Save/Cancel buttons */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <m.div
                  key="edit-actions"
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleSave}
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCancel}
                    className="text-zinc-400 hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </m.div>
              ) : (
                <m.div
                  key="view-actions"
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-zinc-400 hover:text-white"
                  >
                    Edit
                  </Button>
                </m.div>
              )}
            </AnimatePresence>

            {/* External link */}
            <m.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon-sm" asChild>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </m.div>

            {/* Delete */}
            <m.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </m.div>
          </div>
        </div>
      </Card>
    </m.div>
  )
}
