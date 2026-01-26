'use client'

import { Link } from '@/lib/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GripVertical, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface LinkCardProps {
  link: Link
  onUpdate: (id: string, data: Partial<Link>) => void
  onDelete: (id: string) => void
}

export function LinkCard({ link, onUpdate, onDelete }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)

  const handleSave = () => {
    onUpdate(link.id, { title, url })
    setIsEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="cursor-grab text-gray-500 hover:text-gray-300">
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="text-2xl">{link.icon}</div>

          <div className="flex-1 space-y-2">
            {isEditing ? (
              <>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Link title"
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-gray-800 border-gray-700"
                />
              </>
            ) : (
              <>
                <p className="font-medium text-white">{link.title}</p>
                <p className="text-sm text-gray-400 truncate">{link.url}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{link.click_count} clicks</span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdate(link.id, { is_active: !link.is_active })}
            >
              {link.is_active ? (
                <Eye className="h-4 w-4 text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            {isEditing ? (
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}

            <Button variant="ghost" size="icon" asChild>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(link.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
