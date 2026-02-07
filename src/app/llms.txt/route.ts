import { NextResponse } from 'next/server'

const LLMS_TXT = `# LinkHub

> The link-in-bio platform that AI agents can read and act on.

LinkHub gives every user a personalized page with all their important links, social profiles, and services — accessible to both humans and AI agents.

## How to Access Profiles

### Full Profile (JSON)
\`\`\`
GET /api/profiles/{username}
Accept: application/json
\`\`\`

Returns: profile info, links, social accounts, stats, and navigation metadata.

### Agent Card (Compact)
\`\`\`
GET /api/profiles/{username}/card
\`\`\`

Returns: minimal identity + links + social + capabilities — designed for fast agent consumption.

### Content Negotiation
\`\`\`
GET /{username}
Accept: application/json
\`\`\`

Returns JSON profile instead of HTML when \`Accept: application/json\` is set.

### Visual Profile (HTML)
\`\`\`
GET /{username}
\`\`\`

Returns the animated, human-readable profile page.

## Example: Get Kaniel's Profile
\`\`\`
curl -H "Accept: application/json" https://linkhub-iota-red.vercel.app/kaniel
\`\`\`

## Available Data
- **Profile**: name, bio, avatar, verified status
- **Links**: title, URL, icon — all active links the user has published
- **Social**: platform + URL for LinkedIn, Twitter/X, GitHub, Instagram, YouTube, etc.
- **Stats**: link count, social count

## API Specification
Full OpenAPI 3.1 spec available at:
\`\`\`
GET /api/openapi.json
\`\`\`

## Rate Limits
- Public endpoints: 60 requests/minute per IP
- No authentication required for read-only access

## MCP (Model Context Protocol)

LinkHub supports the Model Context Protocol. Each user profile is an MCP endpoint.

### Connecting

1. Discovery: GET /.well-known/mcp.json
2. Endpoint: POST /api/mcp/{username}
3. Transport: Streamable HTTP (JSON-RPC 2.0)
4. Auth: Bearer token (API key from dashboard) - required for write operations

### Available Tools

- get_profile: Get profile info, bio, links, socials
- list_links: List all active links with URLs
- list_services: List services with pricing
- send_message: Send inquiry to a service (auth required)
- request_quote: Request a quote for a service (auth required)

### Available Resources

- linkhub://{username}/profile — Profile overview
- linkhub://{username}/links — All active links
- linkhub://{username}/services — Available services
- linkhub://{username}/social — Social media accounts

### Example

POST /api/mcp/kaniel
Content-Type: application/json

{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_profile", "arguments": {}}}

## Contact
Built by Kaniel Tordjman — https://linkhub-iota-red.vercel.app/kaniel
`

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
