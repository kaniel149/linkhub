import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LinksManager } from '@/components/dashboard/links-manager'

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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Links</h1>
      <LinksManager
        initialLinks={links || []}
        profileId={user.id}
        isPremium={profile?.is_premium || false}
      />
    </div>
  )
}
