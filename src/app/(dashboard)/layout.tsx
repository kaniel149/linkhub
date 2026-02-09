import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Toaster } from 'sonner'
import { Profile } from '@/lib/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  if (!profile.onboarding_completed_at) {
    redirect('/onboard')
  }

  return (
    <div className="flex h-screen bg-[var(--lh-surface-1)] text-[#F5F5F7]">
      <DashboardShell profile={profile as Profile}>
        {children}
      </DashboardShell>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--lh-surface-3)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#F5F5F7',
          },
        }}
      />
    </div>
  )
}
