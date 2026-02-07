import { getSupabaseAdmin } from './auth'
import { demoProfile, demoServices, DEMO_USERNAME } from '@/lib/demo-data'
import { formatPrice } from '@/lib/types/database'
import type { Service, Link, SocialEmbed } from '@/lib/types/database'

/**
 * MCP Tool Definitions
 *
 * Each tool has a JSON Schema `inputSchema` and a `call` function that
 * executes the tool against Supabase (or demo data for the demo user).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

interface ToolCallResult {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

interface ToolCallContext {
  username: string
  profileId?: string
  permissions?: string[]
}

// ---------------------------------------------------------------------------
// Tool definitions (returned by tools/list)
// ---------------------------------------------------------------------------

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'get_profile',
    description:
      'Get the full profile of this LinkHub user, including display name, bio, avatar, theme, and summary stats. This is the best starting point for understanding who this person is.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'list_links',
    description:
      'List all active links on this profile. Returns title, URL, icon, and click count for each link, sorted by position.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'list_services',
    description:
      'List all active services offered by this user. Returns title, description, category, pricing info, and available actions for each service.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'send_message',
    description:
      'Send an inquiry message to a specific service offered by this user. Requires "inquire" permission on the API key. The user will receive the message in their dashboard.',
    inputSchema: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'The ID of the service to inquire about',
        },
        sender_name: {
          type: 'string',
          description: 'Name of the person or agent sending the inquiry',
        },
        sender_email: {
          type: 'string',
          format: 'email',
          description: 'Contact email for the inquiry',
        },
        message: {
          type: 'string',
          description: 'The inquiry message content',
        },
      },
      required: ['service_id', 'sender_name', 'sender_email', 'message'],
    },
  },
  {
    name: 'request_quote',
    description:
      'Request a price quote for a specific service. Similar to send_message but specifically for pricing inquiries. Requires "inquire" permission on the API key.',
    inputSchema: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'The ID of the service to request a quote for',
        },
        sender_name: {
          type: 'string',
          description: 'Name of the person or agent requesting the quote',
        },
        sender_email: {
          type: 'string',
          format: 'email',
          description: 'Contact email for the quote response',
        },
        project_description: {
          type: 'string',
          description:
            'Description of the project or requirements for accurate quoting',
        },
        budget_range: {
          type: 'string',
          description: 'Optional budget range (e.g. "$1k-5k", "under $500")',
        },
        timeline: {
          type: 'string',
          description: 'Desired timeline or deadline',
        },
      },
      required: ['service_id', 'sender_name', 'sender_email', 'project_description'],
    },
  },
]

// ---------------------------------------------------------------------------
// Helpers: resolve profile data from Supabase or demo
// ---------------------------------------------------------------------------

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

interface ProfileData {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_premium: boolean
  theme: { primaryColor: string; backgroundColor: string }
  links: Link[]
  social_embeds: SocialEmbed[]
}

async function resolveProfile(
  username: string
): Promise<ProfileData | null> {
  if (username === DEMO_USERNAME) {
    return demoProfile as ProfileData
  }

  const { data: profile, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('*, links(*), social_embeds(*)')
    .eq('username', username)
    .single()

  if (error || !profile) return null
  return profile as unknown as ProfileData
}

async function resolveServices(
  username: string,
  profileId?: string
): Promise<Service[]> {
  if (username === DEMO_USERNAME) {
    return demoServices
  }

  if (!profileId) return []

  const { data: services } = await getSupabaseAdmin()
    .from('services')
    .select('*')
    .eq('profile_id', profileId)
    .eq('is_active', true)
    .order('position')

  return (services as Service[]) || []
}

function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http')) return avatarUrl
  return `${BASE_URL}${avatarUrl}`
}

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

export async function callTool(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolCallContext
): Promise<ToolCallResult> {
  try {
    switch (toolName) {
      case 'get_profile':
        return await toolGetProfile(context)
      case 'list_links':
        return await toolListLinks(context)
      case 'list_services':
        return await toolListServices(context)
      case 'send_message':
        return await toolSendMessage(args, context)
      case 'request_quote':
        return await toolRequestQuote(args, context)
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
          isError: true,
        }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return {
      content: [{ type: 'text', text: `Tool error: ${message}` }],
      isError: true,
    }
  }
}

// ---------------------------------------------------------------------------
// Individual tool implementations
// ---------------------------------------------------------------------------

async function toolGetProfile(ctx: ToolCallContext): Promise<ToolCallResult> {
  const profile = await resolveProfile(ctx.username)
  if (!profile) {
    return {
      content: [{ type: 'text', text: `Profile "${ctx.username}" not found.` }],
      isError: true,
    }
  }

  const activeLinks = profile.links
    .filter((l) => l.is_active)
    .sort((a, b) => a.position - b.position)
  const activeSocials = profile.social_embeds
    .filter((s) => s.is_active)
    .sort((a, b) => a.position - b.position)
  const services = await resolveServices(ctx.username, profile.id)

  const text = [
    `# ${profile.display_name || profile.username}`,
    '',
    profile.bio || '',
    '',
    `**Username:** @${profile.username}`,
    `**Avatar:** ${resolveAvatarUrl(profile.avatar_url) || 'None'}`,
    `**Verified:** ${profile.is_premium ? 'Yes' : 'No'}`,
    '',
    `## Stats`,
    `- Links: ${activeLinks.length}`,
    `- Social accounts: ${activeSocials.length}`,
    `- Services: ${services.length}`,
    '',
    `## Web Profile`,
    `${BASE_URL}/${profile.username}`,
  ].join('\n')

  return { content: [{ type: 'text', text }] }
}

async function toolListLinks(ctx: ToolCallContext): Promise<ToolCallResult> {
  const profile = await resolveProfile(ctx.username)
  if (!profile) {
    return {
      content: [{ type: 'text', text: `Profile "${ctx.username}" not found.` }],
      isError: true,
    }
  }

  const activeLinks = profile.links
    .filter((l) => l.is_active)
    .sort((a, b) => a.position - b.position)

  if (activeLinks.length === 0) {
    return { content: [{ type: 'text', text: 'No active links.' }] }
  }

  const lines = activeLinks.map(
    (l, i) =>
      `${i + 1}. ${l.icon} **${l.title}**\n   ${l.url}\n   Clicks: ${l.click_count}`
  )

  return {
    content: [
      {
        type: 'text',
        text: `# Links for @${ctx.username}\n\n${lines.join('\n\n')}`,
      },
    ],
  }
}

async function toolListServices(ctx: ToolCallContext): Promise<ToolCallResult> {
  const profile = await resolveProfile(ctx.username)
  if (!profile) {
    return {
      content: [{ type: 'text', text: `Profile "${ctx.username}" not found.` }],
      isError: true,
    }
  }

  const services = await resolveServices(ctx.username, profile.id)

  if (services.length === 0) {
    return { content: [{ type: 'text', text: 'No active services.' }] }
  }

  const lines = services.map((s, i) => {
    const price = formatPrice(s.pricing, s.price_amount, s.price_currency)
    return [
      `${i + 1}. **${s.title}** (${s.category})`,
      `   ${s.description || 'No description'}`,
      `   Price: ${price}`,
      `   Action: ${s.action_type}`,
      `   ID: ${s.id}`,
    ].join('\n')
  })

  return {
    content: [
      {
        type: 'text',
        text: `# Services offered by @${ctx.username}\n\n${lines.join('\n\n')}`,
      },
    ],
  }
}

async function toolSendMessage(
  args: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  // Permission check
  if (!ctx.permissions?.includes('inquire')) {
    return {
      content: [
        {
          type: 'text',
          text: 'Permission denied. Your API key needs the "inquire" permission to send messages.',
        },
      ],
      isError: true,
    }
  }

  const serviceId = args.service_id as string
  const senderName = args.sender_name as string
  const senderEmail = args.sender_email as string
  const message = args.message as string

  if (!serviceId || !senderName || !senderEmail || !message) {
    return {
      content: [
        {
          type: 'text',
          text: 'Missing required fields: service_id, sender_name, sender_email, message',
        },
      ],
      isError: true,
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(senderEmail)) {
    return {
      content: [{ type: 'text', text: 'Invalid email format.' }],
      isError: true,
    }
  }

  // Demo profile: don't actually write
  if (ctx.username === DEMO_USERNAME) {
    return {
      content: [
        {
          type: 'text',
          text: 'Message received (demo mode). In production, this would be delivered to the user\'s inbox.',
        },
      ],
    }
  }

  // Verify service exists and is active
  const { data: service, error: serviceError } = await getSupabaseAdmin()
    .from('services')
    .select('id, profile_id, is_active')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return {
      content: [{ type: 'text', text: `Service not found: ${serviceId}` }],
      isError: true,
    }
  }

  if (!service.is_active) {
    return {
      content: [
        { type: 'text', text: 'This service is not currently available.' },
      ],
      isError: true,
    }
  }

  // Insert inquiry
  const { data: inquiry, error } = await getSupabaseAdmin()
    .from('service_inquiries')
    .insert({
      service_id: serviceId,
      profile_id: service.profile_id,
      sender_name: senderName,
      sender_email: senderEmail,
      message,
      source: 'agent' as const,
      agent_identifier: 'mcp-api',
    })
    .select('id, created_at')
    .single()

  if (error) {
    return {
      content: [
        { type: 'text', text: `Failed to submit inquiry: ${error.message}` },
      ],
      isError: true,
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `Message sent successfully.\nInquiry ID: ${inquiry.id}\nCreated: ${inquiry.created_at}`,
      },
    ],
  }
}

async function toolRequestQuote(
  args: Record<string, unknown>,
  ctx: ToolCallContext
): Promise<ToolCallResult> {
  // Permission check
  if (!ctx.permissions?.includes('inquire')) {
    return {
      content: [
        {
          type: 'text',
          text: 'Permission denied. Your API key needs the "inquire" permission to request quotes.',
        },
      ],
      isError: true,
    }
  }

  const serviceId = args.service_id as string
  const senderName = args.sender_name as string
  const senderEmail = args.sender_email as string
  const projectDescription = args.project_description as string
  const budgetRange = (args.budget_range as string) || ''
  const timeline = (args.timeline as string) || ''

  if (!serviceId || !senderName || !senderEmail || !projectDescription) {
    return {
      content: [
        {
          type: 'text',
          text: 'Missing required fields: service_id, sender_name, sender_email, project_description',
        },
      ],
      isError: true,
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(senderEmail)) {
    return {
      content: [{ type: 'text', text: 'Invalid email format.' }],
      isError: true,
    }
  }

  // Build the quote message
  const messageParts = [
    '[Quote Request]',
    '',
    `**Project:** ${projectDescription}`,
  ]
  if (budgetRange) messageParts.push(`**Budget:** ${budgetRange}`)
  if (timeline) messageParts.push(`**Timeline:** ${timeline}`)
  const message = messageParts.join('\n')

  // Demo profile: don't actually write
  if (ctx.username === DEMO_USERNAME) {
    return {
      content: [
        {
          type: 'text',
          text: 'Quote request received (demo mode). In production, this would be delivered to the user\'s inbox.',
        },
      ],
    }
  }

  // Verify service exists and is active
  const { data: service, error: serviceError } = await getSupabaseAdmin()
    .from('services')
    .select('id, profile_id, is_active')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return {
      content: [{ type: 'text', text: `Service not found: ${serviceId}` }],
      isError: true,
    }
  }

  if (!service.is_active) {
    return {
      content: [
        { type: 'text', text: 'This service is not currently available.' },
      ],
      isError: true,
    }
  }

  // Insert inquiry
  const { data: inquiry, error } = await getSupabaseAdmin()
    .from('service_inquiries')
    .insert({
      service_id: serviceId,
      profile_id: service.profile_id,
      sender_name: senderName,
      sender_email: senderEmail,
      message,
      source: 'agent' as const,
      agent_identifier: 'mcp-api',
    })
    .select('id, created_at')
    .single()

  if (error) {
    return {
      content: [
        { type: 'text', text: `Failed to submit quote request: ${error.message}` },
      ],
      isError: true,
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `Quote request submitted successfully.\nInquiry ID: ${inquiry.id}\nCreated: ${inquiry.created_at}`,
      },
    ],
  }
}
