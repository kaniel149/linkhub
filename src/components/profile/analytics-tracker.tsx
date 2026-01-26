'use client'

import { useEffect } from 'react'

interface AnalyticsTrackerProps {
  profileId: string
  userAgent: string
  referer: string
}

export function AnalyticsTracker({ profileId, userAgent, referer }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Track page view on mount
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        eventType: 'page_view',
        userAgent,
        referer,
      }),
    })
  }, [profileId, userAgent, referer])

  return null
}

export function trackLinkClick(profileId: string, linkId: string) {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId,
      linkId,
      eventType: 'link_click',
    }),
  })
}
