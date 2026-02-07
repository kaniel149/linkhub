import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { updates } = await request.json()

  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: 'Invalid updates' }, { status: 400 })
  }

  // Update each link's position, scoped to the authenticated user
  const results = await Promise.all(
    updates.map(({ id, position }: { id: string; position: number }) =>
      supabase
        .from('links')
        .update({ position })
        .eq('id', id)
        .eq('profile_id', user.id)
    )
  )

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
