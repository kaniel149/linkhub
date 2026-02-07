import { NextRequest, NextResponse } from 'next/server'
import { handleRequest } from '@/lib/mcp/server'
import { validateApiKey, getSupabaseAdmin } from '@/lib/mcp/auth'
import { detectAgent } from '@/lib/agent-detection'
import { DEMO_USERNAME } from '@/lib/demo-data'
import type { AuthResult } from '@/lib/mcp/auth'
import type { JsonRpcResponse } from '@/lib/mcp/server'

/**
 * MCP Endpoint — POST /api/mcp/{username}
 *
 * Accepts JSON-RPC 2.0 requests over HTTP (Streamable HTTP transport).
 *
 * Auth behaviour:
 *   - Read operations (get_profile, list_links, list_services, resources/read)
 *     work without authentication.
 *   - Write operations (send_message, request_quote) require an API key with
 *     the "inquire" permission.
 *   - The `initialize` and `tools/list` methods never require auth.
 */

// Methods that are always public (no API key required)
const PUBLIC_METHODS = new Set([
  'initialize',
  'ping',
  'tools/list',
  'tools/call', // auth checked per-tool inside server.ts
  'resources/list',
  'resources/read',
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  // ---- CORS preflight support (for browser-based MCP clients) ----
  const headers = {
    'Content-Type': 'application/json',
    'X-LinkHub-MCP': '1.0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // ---- Parse body ----
  let body: unknown
  try {
    body = await request.json()
  } catch {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: 0,
      error: { code: -32700, message: 'Parse error: invalid JSON' },
    }
    return NextResponse.json(errorResponse, { status: 400, headers })
  }

  // ---- Authenticate (optional — only enforced for write tools) ----
  const authHeader = request.headers.get('authorization')
  let auth: AuthResult | null = null

  if (authHeader) {
    auth = await validateApiKey(authHeader)
    // If a key was provided but is invalid, reject immediately
    if (!auth.valid) {
      const errorResponse: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: (body as Record<string, unknown>)?.id as string | number ?? 0,
        error: { code: -32001, message: auth.error || 'Authentication failed' },
      }
      return NextResponse.json(errorResponse, { status: 401, headers })
    }
  }

  // ---- Handle the JSON-RPC request ----
  const response = await handleRequest(body, username, auth)

  // ---- Track agent visit (fire-and-forget) ----
  trackMcpVisit(username, request, body).catch(() => {})

  return NextResponse.json(response, { status: 200, headers })
}

/**
 * OPTIONS handler for CORS preflight.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// ---------------------------------------------------------------------------
// Agent visit tracking (fire-and-forget)
// ---------------------------------------------------------------------------

async function trackMcpVisit(
  username: string,
  request: NextRequest,
  body: unknown
) {
  try {
    // Resolve the profile id (needed for agent_visits table)
    let profileId: string | null = null

    if (username === DEMO_USERNAME) {
      profileId = 'demo-kaniel-001'
    } else {
      const { data: profile } = await getSupabaseAdmin()
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      profileId = profile?.id ?? null
    }

    if (!profileId) return

    // Detect agent from User-Agent
    const userAgent = request.headers.get('user-agent') || ''
    const agent = detectAgent(userAgent)

    // Determine agent identifier — use detected agent or fall back to "mcp-client"
    const agentIdentifier = agent.isAgent
      ? agent.identifier!
      : 'mcp-client'
    const agentName = agent.isAgent ? agent.name : 'MCP Client'

    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      null

    const method = (body as Record<string, unknown>)?.method as string | undefined

    // Don't track visits for the demo profile in Supabase
    if (username === DEMO_USERNAME) return

    await getSupabaseAdmin().from('agent_visits').insert({
      profile_id: profileId,
      agent_identifier: agentIdentifier,
      agent_name: agentName,
      user_agent: userAgent.slice(0, 500),
      endpoint: `/api/mcp/${username}`,
      method: method ? `MCP:${method}` : 'MCP:unknown',
      country,
    })
  } catch {
    // Fire and forget
  }
}
