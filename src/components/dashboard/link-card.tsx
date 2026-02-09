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
          'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] p-4 transition-all duration-200',
          !link.is_active && 'opacity-50',
          isEditing && 'ring-2 ring-[rgba(0,113,227,0.4)] border-[#0071E3]',
          isDragging && 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] border-[rgba(255,255,255,0.12)]',
          !isDragging && !isEditing && 'hover:border-[rgba(255,255,255,0.12)]'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          {!isEditing && (
            <div
              className={cn(
                "touch-none text-[rgba(255,255,255,0.15)] hover:text-[rgba(255,255,255,0.3)] transition-colors",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          {/* Icon */}
          <div className="text-2xl flex-shrink-0">
            {link.icon || '\uD83D\uDD17'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
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
                    autoFocus
                  />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://..."
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
                      'font-medium text-[#F5F5F7] text-[14px] truncate',
                      !link.is_active && 'line-through text-[#48484A]'
                    )}
                  >
                    {link.title}
                  </p>
                  <p className="text-[12px] text-[#6E6E73] truncate">{link.url}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Click count */}
            <div className="flex items-center gap-1 text-[12px] text-[#6E6E73] px-2 tabular-nums">
              <BarChart2 className="h-3 w-3" />
              <span>{link.click_count}</span>
            </div>

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
                  className="flex items-center gap-0.5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleSave}
                    className="text-[#30D158] hover:text-[#30D158] hover:bg-[rgba(48,209,88,0.1)]"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCancel}
                    className="text-[#86868B] hover:text-[#F5F5F7]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </m.div>
              ) : (
                <m.div
                  key="view-actions"
                  className="flex items-center gap-0.5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-[#86868B] hover:text-[#F5F5F7]"
                  >
                    Edit
                  </Button>
                </m.div>
              )}
            </AnimatePresence>

            {/* External link */}
            <Button variant="ghost" size="icon-sm" asChild className="text-[#86868B] hover:text-[#F5F5F7]">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              className="text-[#FF453A] hover:text-[#FF453A] hover:bg-[rgba(255,69,58,0.1)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </m.div>
  )
}
