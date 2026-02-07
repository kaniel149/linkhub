import { NextResponse } from 'next/server'

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

export async function GET() {
  const discovery = {
    schema_version: '1.0',
    name: 'LinkHub MCP Gateway',
    description:
      'Connect AI agents to LinkHub profiles. Each user profile exposes an MCP endpoint with tools for reading profile data, listing services, and submitting inquiries.',
    endpoint_template: `${BASE_URL}/api/mcp/{username}`,
    transport: 'streamable-http',
    authentication: {
      type: 'bearer',
      description: 'API key from your LinkHub dashboard. Format: lh_xxxx...',
      required_for: ['tools/call with write operations'],
      optional_for: [
        'initialize',
        'tools/list',
        'resources/list',
        'resources/read',
        'tools/call with read operations',
      ],
    },
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
    },
    tools: [
      {
        name: 'get_profile',
        description: 'Get full profile information',
        auth_required: false,
      },
      {
        name: 'list_links',
        description: 'List all active links',
        auth_required: false,
      },
      {
        name: 'list_services',
        description: 'List available services',
        auth_required: false,
      },
      {
        name: 'send_message',
        description: 'Send a message/inquiry to a service',
        auth_required: true,
      },
      {
        name: 'request_quote',
        description: 'Request a quote for a service',
        auth_required: true,
      },
    ],
    resources: [
      {
        uri_template: 'linkhub://{username}/profile',
        description: 'Profile overview',
      },
      {
        uri_template: 'linkhub://{username}/links',
        description: 'Active links',
      },
      {
        uri_template: 'linkhub://{username}/services',
        description: 'Available services',
      },
      {
        uri_template: 'linkhub://{username}/social',
        description: 'Social media accounts',
      },
    ],
    documentation: `${BASE_URL}/llms.txt`,
    openapi: `${BASE_URL}/api/openapi.json`,
    _links: {
      self: `${BASE_URL}/.well-known/mcp.json`,
      api: `${BASE_URL}/api/openapi.json`,
      llms_txt: `${BASE_URL}/llms.txt`,
    },
  }

  return NextResponse.json(discovery, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
