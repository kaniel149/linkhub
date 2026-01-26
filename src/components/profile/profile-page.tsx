'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import { AnimatedBackground } from './animated-background'
import { LinkButton } from './link-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

interface ProfilePageProps {
  profile: ProfileWithLinks
  onLinkClick: (linkId: string) => void
}

export function ProfilePage({ profile, onLinkClick }: ProfilePageProps) {
  const theme = profile.theme
  const activeLinks = profile.links.filter((l) => l.is_active)

  return (
    <>
      <AnimatedBackground
        primaryColor={theme.primaryColor}
        backgroundColor={theme.backgroundColor}
      />

      <div className="min-h-screen flex flex-col items-center pt-16 px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-gray-800">
              {profile.display_name?.[0] || profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold text-white mb-2">
            {profile.display_name || profile.username}
          </h1>

          {profile.bio && (
            <p className="text-gray-300 max-w-sm mx-auto">
              {profile.bio}
            </p>
          )}
        </motion.div>

        <div className="w-full max-w-md space-y-3">
          {activeLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LinkButton
                link={link}
                primaryColor={theme.primaryColor}
                onClick={() => onLinkClick(link.id)}
              />
            </motion.div>
          ))}
        </div>

        {!profile.is_premium && (
          <motion.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-sm text-gray-500 hover:text-gray-400"
          >
            Powered by LinkHub
          </motion.a>
        )}
      </div>
    </>
  )
}
