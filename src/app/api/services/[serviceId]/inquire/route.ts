import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params
  const body = await request.json()
  const { sender_name, sender_email, message, source, agent_identifier } = body

  if (!sender_name || !sender_email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sender_email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const supabase = await createClient()

  // Verify service exists and get profile_id
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, profile_id, is_active')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  if (!service.is_active) {
    return NextResponse.json({ error: 'This service is not currently available' }, { status: 400 })
  }

  const { data: inquiry, error } = await supabase
    .from('service_inquiries')
    .insert({
      service_id: serviceId,
      profile_id: service.profile_id,
      sender_name,
      sender_email,
      message: message || null,
      source: source || 'human',
      agent_identifier: agent_identifier || null,
    })
    .select('id, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    inquiry_id: inquiry.id,
    message: 'Your inquiry has been submitted successfully',
  }, { status: 201 })
}
