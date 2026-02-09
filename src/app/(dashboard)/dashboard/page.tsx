import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LinksManager } from '@/components/dashboard/links-manager'
import { ProfileCompletion } from '@/components/dashboard/profile-completion'
import type { Profile } from '@/lib/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', user.id)
    .order('position')

  const linkCount = links?.length ?? 0
  const typedProfile = profile as Profile | null

  // Show completion card if any profile field is missing
  const isProfileComplete = typedProfile
    ? !!(typedProfile.avatar_url && typedProfile.bio?.trim() && typedProfile.onboarding_completed_at && linkCount > 0)
    : false

  return (
    <div className="max-w-2xl mx-auto">
      {typedProfile && !isProfileComplete && (
        <ProfileCompletion profile={typedProfile} linkCount={linkCount} />
      )}
      <LinksManager
        initialLinks={links || []}
        profileId={user.id}
        isPremium={profile?.is_premium || false}
      />
    </div>
  )
}
