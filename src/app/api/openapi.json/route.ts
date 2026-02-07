import { NextResponse } from 'next/server'

const BASE_URL = 'https://linkhub-iota-red.vercel.app'

const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'LinkHub API',
    description:
      'Public API for accessing LinkHub user profiles, links, and social accounts. Designed for both human developers and AI agents.',
    version: '1.0.0',
    contact: {
      name: 'LinkHub',
      url: BASE_URL,
    },
  },
  servers: [
    {
      url: BASE_URL,
      description: 'Production',
    },
  ],
  paths: {
    '/api/profiles/{username}': {
      get: {
        operationId: 'getProfile',
        summary: 'Get full profile',
        description:
          'Returns complete profile information including links, social accounts, stats, and navigation metadata.',
        tags: ['Profiles'],
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The username of the profile to retrieve',
            example: 'kaniel',
          },
        ],
        responses: {
          '200': {
            description: 'Profile found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfileResponse' },
              },
            },
          },
          '404': {
            description: 'Profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/profiles/{username}/card': {
      get: {
        operationId: 'getAgentCard',
        summary: 'Get compact agent card',
        description:
          'Returns a minimal, fast-loading "business card" designed for AI agent consumption. Contains identity, links, social, capabilities, and endpoint URLs.',
        tags: ['Profiles'],
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'kaniel',
          },
        ],
        responses: {
          '200': {
            description: 'Agent card',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AgentCardResponse' },
              },
            },
          },
          '404': {
            description: 'Profile not found',
          },
        },
      },
    },
    '/{username}': {
      get: {
        operationId: 'getProfilePage',
        summary: 'Get profile (content negotiation)',
        description:
          'Returns HTML profile page by default. When `Accept: application/json` header is set, returns the same JSON as /api/profiles/{username}.',
        tags: ['Profiles'],
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'kaniel',
          },
          {
            name: 'Accept',
            in: 'header',
            schema: { type: 'string', enum: ['text/html', 'application/json'] },
            description: 'Set to application/json to receive JSON instead of HTML',
          },
        ],
        responses: {
          '200': {
            description: 'Profile page (HTML) or profile JSON',
          },
        },
      },
    },
    '/llms.txt': {
      get: {
        operationId: 'getLlmsTxt',
        summary: 'LLM instructions',
        description:
          'Returns a plain-text markdown document describing how AI agents should interact with LinkHub profiles.',
        tags: ['Discovery'],
        responses: {
          '200': {
            description: 'LLM instructions in markdown',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
    '/api/openapi.json': {
      get: {
        operationId: 'getOpenApiSpec',
        summary: 'OpenAPI specification',
        description: 'Returns this OpenAPI 3.1 specification document.',
        tags: ['Discovery'],
        responses: {
          '200': {
            description: 'OpenAPI spec',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ProfileResponse: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'kaniel' },
          display_name: { type: 'string', example: 'Kaniel Tordjman' },
          bio: {
            type: 'string',
            example:
              'Full Stack Developer & AI Builder | Solar Energy Entrepreneur',
          },
          avatar_url: {
            type: 'string',
            format: 'uri',
            example: `${BASE_URL}/demo/clean-800.png`,
          },
          theme: {
            type: 'object',
            properties: {
              primary_color: { type: 'string', example: '#38bdf8' },
              background_color: { type: 'string', example: '#030712' },
            },
          },
          is_verified: { type: 'boolean' },
          links: {
            type: 'array',
            items: { $ref: '#/components/schemas/LinkItem' },
          },
          social: {
            type: 'array',
            items: { $ref: '#/components/schemas/SocialItem' },
          },
          stats: {
            type: 'object',
            properties: {
              link_count: { type: 'integer' },
              social_count: { type: 'integer' },
            },
          },
          _meta: {
            type: 'object',
            properties: {
              self: { type: 'string', format: 'uri' },
              card: { type: 'string', format: 'uri' },
              web: { type: 'string', format: 'uri' },
              llms_txt: { type: 'string', format: 'uri' },
              openapi: { type: 'string', format: 'uri' },
            },
          },
        },
      },
      AgentCardResponse: {
        type: 'object',
        properties: {
          v: { type: 'string', example: '1.0' },
          type: { type: 'string', example: 'agent-card' },
          identity: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              handle: { type: 'string' },
              bio: { type: 'string' },
              verified: { type: 'boolean' },
            },
          },
          avatar: { type: 'string', format: 'uri' },
          reach: {
            type: 'object',
            properties: {
              links: { type: 'integer' },
              clicks: { type: 'integer' },
            },
          },
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string', format: 'uri' },
              },
            },
          },
          social: {
            type: 'object',
            additionalProperties: { type: 'string', format: 'uri' },
          },
          capabilities: {
            type: 'array',
            items: { type: 'string' },
          },
          endpoints: {
            type: 'object',
            additionalProperties: { type: 'string', format: 'uri' },
          },
          updated: { type: 'string', format: 'date-time' },
        },
      },
      LinkItem: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Navitas CRM' },
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://crm.navitas.co.il',
          },
          icon: { type: 'string', example: '☀️' },
          position: { type: 'integer' },
        },
      },
      SocialItem: {
        type: 'object',
        properties: {
          platform: {
            type: 'string',
            enum: [
              'linkedin',
              'twitter',
              'instagram',
              'github',
              'youtube',
              'tiktok',
              'spotify',
            ],
          },
          url: { type: 'string', format: 'uri' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          username: { type: 'string' },
        },
      },
    },
  },
  tags: [
    {
      name: 'Profiles',
      description: 'Access user profiles, links, and social accounts',
    },
    {
      name: 'Discovery',
      description: 'API documentation and agent discovery endpoints',
    },
  ],
}

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
