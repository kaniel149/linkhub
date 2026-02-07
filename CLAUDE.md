# LinkHub - Claude Instructions

## Project Overview
LinkHub is a "link-in-bio" application similar to Linktree. Users create personalized pages with all their important links in one place.

## Current State (2026-02-08)

### 🚀 Deployed to Production
- **URL**: https://linkhub-iota-red.vercel.app
- **Demo Profile**: https://linkhub-iota-red.vercel.app/kaniel
- **GitHub**: https://github.com/kaniel149/linkhub
- **Hosting**: Vercel (auto-deploys from main branch)

### ✅ Dual-Interface Architecture — ALL 5 PHASES COMPLETE

**"The link-in-bio that AI agents can read and act on."** — Full dual-interface architecture implemented across 5 phases.

#### Phase 5: Service Marketplace (Complete) — `b8c8f16`

1. **Integrations DB** (`supabase/migrations/005_integrations.sql`)
   - `integrations` table (provider, config jsonb, is_active, connected_at, last_synced_at)
   - `services.integration_id` foreign key
   - RLS policies, indexes, update trigger

2. **Integration Connectors** (`src/lib/integrations/`)
   - `calendly.ts` — OAuth flow stubs (getCalendlyAuthUrl, exchangeCalendlyCode)
   - `stripe.ts` — Stripe Connect OAuth stubs (getStripeConnectUrl, exchangeStripeCode)
   - `webhook.ts` — Full implementation with HMAC-SHA256 signing, event validation

3. **Integrations API** (`src/app/api/integrations/route.ts`)
   - CRUD with plan limit enforcement (free: 0, premium: 10)
   - Duplicate provider detection, provider validation

4. **Integrations Dashboard** (`src/app/(dashboard)/dashboard/integrations/page.tsx`)
   - 5 provider cards: Calendly, Cal.com, Stripe, Webhook, Zapier
   - Connect/configure/disconnect flow, premium gating
   - Brand colors per provider, motion animations

5. **Landing Page Redesign** (`src/components/landing/features.tsx`)
   - 6 AI-themed features: AI-Agent Ready, MCP Gateway, Services & Actions, Agent Analytics, Connect Services, Smart Links
   - Header: "Built for the AI era" / "Your Profile. AI Superpowers."
   - Per-card glow effects, shimmer lines, enhanced hover animations

6. **Pricing Update** (`src/components/landing/pricing.tsx`)
   - Free: 5 links, 2 embeds, 7-day analytics, 1 service, public API
   - Pro ($9/mo): unlimited, MCP endpoint, 5 API keys, agent analytics, 10 integrations, custom domain
   - Animated gradient border on Pro card, "Most Popular" badge

7. **Updated Types** (`src/lib/types/database.ts`)
   - Integration, IntegrationProvider types
   - PLAN_LIMITS: maxIntegrations (0/10), mcpAccess (false/true)

#### Phase 4: MCP Gateway (Complete) — `bbcb4e7`

1. **MCP Server** (`src/lib/mcp/server.ts`, `tools.ts`, `resources.ts`, `auth.ts`)
   - JSON-RPC 2.0 protocol handler at `/api/mcp/{username}`
   - 5 tools: get_profile, list_links, list_services, send_message, request_quote
   - 4 resources: linkhub://{username}/profile, /links, /services, /social
   - API key auth with SHA-256 hashing + hourly rate limiting

2. **API Keys Dashboard** (`src/app/(dashboard)/dashboard/api-keys/page.tsx`)
   - Create/revoke API keys, copy-to-clipboard reveal
   - Permission badges (read/write/inquire), rate limit config
   - Premium gating (free: 0 keys, premium: 5 keys)
   - Developer section in sidebar with cyan accent

3. **API Keys CRUD** (`src/app/api/api-keys/route.ts`)
   - Generate `lh_` prefixed keys, SHA-256 hash storage
   - Plan limit enforcement, permission validation

4. **MCP Discovery** (`src/app/.well-known/mcp.json/route.ts`)
   - Standard discovery document with endpoint template + auth info
   - Updated llms.txt with MCP section
   - Updated OpenAPI spec with MCP endpoint + securitySchemes

5. **DB Migration** (`supabase/migrations/004_mcp.sql`)
   - `api_keys` table (key_hash, key_prefix, permissions, rate_limit)
   - `api_rate_limits` table (sliding window)

#### Phase 3: Services & Actions (Complete) — `9c10e29`

1. **Services DB** (`supabase/migrations/003_services.sql`)
   - services + service_inquiries tables with RLS
2. **Services CRUD API** (`src/app/api/services/route.ts`)
3. **Inquiry Endpoint** (`src/app/api/services/[serviceId]/inquire/route.ts`)
4. **Dashboard Services Page** (`src/app/(dashboard)/dashboard/services/page.tsx`)
5. **Public Profile Services** - ServiceCard + ContactModal components
6. **JSON-LD Enhancement** - makesOffer + potentialAction
7. **Types** - Service, ServiceInquiry, formatPrice, display labels

#### Phase 1: Agent-Readable Layer (Complete) — `b64e5e9`

1. **JSON-LD Structured Data** (`src/components/profile/json-ld.tsx`)
2. **Public Profile API** (`src/app/api/profiles/[username]/route.ts`)
3. **llms.txt** (`src/app/llms.txt/route.ts`)
4. **Content Negotiation** (`src/middleware.ts`)
5. **DB Migration** (`supabase/migrations/002_agent_features.sql`)

#### Phase 2: Agent API & Analytics (Complete) — `b64e5e9`

1. **OpenAPI 3.1 Spec** (`src/app/api/openapi.json/route.ts`)
2. **Agent Card** (`src/app/api/profiles/[username]/card/route.ts`)
3. **Agent Detection** (`src/lib/agent-detection.ts`)
4. **Agent Analytics** - Dashboard "AI Agent Activity" section

#### All API Endpoints:
- `GET /api/profiles/{username}` — Full profile JSON
- `GET /api/profiles/{username}/card` — Compact agent card
- `GET /api/openapi.json` — OpenAPI 3.1 spec
- `GET /llms.txt` — AI agent instructions
- `GET /{username}` with `Accept: application/json` — Content negotiation
- `POST /api/mcp/{username}` — MCP JSON-RPC 2.0 endpoint
- `GET /.well-known/mcp.json` — MCP discovery
- `GET/POST/PATCH/DELETE /api/services` — Services CRUD
- `POST /api/services/{serviceId}/inquire` — Public inquiry
- `GET/POST/PATCH/DELETE /api/api-keys` — API key management
- `GET/POST/PATCH/DELETE /api/integrations` — Integration management

#### Build Status: ✅ `npm run build` passes cleanly

#### DB Migrations to Run:
1. `002_agent_features.sql` — Agent visits, expanded event types
2. `003_services.sql` — Services + inquiries tables
3. `004_mcp.sql` — API keys + rate limits
4. `005_integrations.sql` — Integrations table + services FK

---

### Previous Session - Premium Profile + Rich Animations + Deploy

**"Holographic Tech Luminary" aesthetic** — inspired by link.me, redesigned to premium level:

#### Profile Page Redesign:
- **Hero banner** — dark-bg professional headshot (`hero-banner.jpg`) with CSS tech overlays (animated grid, scan line, glow orbs, diagonal circuits)
- **Avatar** — clean professional portrait (`clean-800.png`) with **double rotating conic gradient rings** (cyan glow)
- **Floating particle nodes** — 20 animated dots + 8 connection lines
- **Stats bar** — **animated count-up counters** (12.4K views, 3,829 clicks, 6 links) with animated border (rotating conic gradient)
- **Glass-morphism link cards** — left accent line on hover, **shimmer glint sweep**, click counts, arrow icons, alternating left/right stagger entrance
- **Social bar** — SVG icons (LinkedIn, X, Instagram, GitHub, YouTube) with spring animations
- **Share button** — floating top-right with native share API / clipboard fallback
- **Typing bio effect** — bio text types out character by character
- **Gradient shimmer text** — display name with animated background gradient
- **Verified badge** — wiggle animation every few seconds
- **Pulse glow CTA** — "Create your page" button with pulse + shimmer sweep
- **Color theme** — electric cyan (#38bdf8) on near-black (#030712)
- **Font** — Plus Jakarta Sans

#### Image Setup:
- `hero-banner.jpg` (100KB) — dark-bg professional headshot as hero banner with CSS tech overlay
- `clean-800.png` (475KB) — clean portrait as circular avatar
- `hero-800.png` (531KB) — AI neural network photo (source)
- avatar-400/200/64.png + WebP versions for optimized loading

#### Social Links:
- LinkedIn: https://www.linkedin.com/in/kaniel-turdjman-2000a4189/
- GitHub: https://github.com/kaniel149
- Twitter, Instagram, YouTube

#### Technical Notes:
- All motion components use `m` from `motion/react` (NOT `motion` from `framer-motion`) — LazyMotion strict mode requirement
- Server/Client boundary: no function props passed from Server Components
- Demo profile at `/kaniel` renders static data (no Supabase needed)
- Platform type includes: instagram, tiktok, youtube, spotify, twitter, linkedin, github

### Working Features
- Landing page (hero, how it works, features, pricing, footer)
- OAuth authentication (Google, GitHub, Apple)
- Dashboard with links management (CRUD + drag & drop reorder)
- Dashboard services management (CRUD + inquiry tracking)
- Dashboard API keys management (create/revoke)
- Dashboard integrations management (connect/configure/disconnect)
- Analytics page with charts + agent analytics
- Appearance page (theme customization)
- Social embeds page
- Settings page (profile editing)
- Public profile pages (`/[username]`) with services section
- Demo profile at `/kaniel` with real data
- Auth middleware protecting dashboard routes
- Agent-readable APIs (profile, card, OpenAPI, llms.txt, MCP)
- Content negotiation (JSON for agents, HTML for humans)

### Tech Stack
- Next.js 16.1.4 (App Router)
- TypeScript 5
- Tailwind CSS 4
- Supabase (Auth + Database)
- Motion (Framer Motion) 12
- Recharts (charts)
- @dnd-kit (drag & drop)

## Development

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build
```

## Database
Supabase with tables:
- profiles (user settings, theme)
- links (user links)
- social_embeds (social media embeds)
- analytics_events (page views, clicks, agent events)
- agent_visits (AI agent access tracking)
- services (user services/offerings)
- service_inquiries (inquiry submissions)
- api_keys (MCP authentication)
- api_rate_limits (rate limiting)
- integrations (external service connectors)

## Environment Variables
See `.env.local` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for MCP server)

## Key Files
- `src/lib/demo-data.ts` - Demo profile data for /kaniel
- `src/lib/motion.ts` - Complete animation system (tokens, springs, variants)
- `src/lib/mcp/` - MCP server (server.ts, tools.ts, resources.ts, auth.ts)
- `src/lib/integrations/` - External connectors (calendly, stripe, webhook)
- `src/lib/agent-detection.ts` - AI agent user-agent detection
- `src/lib/types/database.ts` - All TypeScript types + plan limits
- `src/components/landing/` - hero, how-it-works, features, pricing, footer, navbar
- `src/components/profile/` - profile-page, link-button, social-bar, service-card, contact-modal, json-ld
- `src/components/dashboard/` - links-manager (with DnD), link-card, sidebar, etc.
- `public/demo/` - Optimized avatar images + OG image

## Remaining Tasks
- [x] Deploy to production ✅ (https://linkhub-iota-red.vercel.app)
- [x] Dual-Interface Architecture (all 5 phases) ✅
- [ ] **Run DB migrations** — 002, 003, 004, 005 on Supabase
- [ ] **Self-service flow** — users sign up, upload photo, add links, build their own style
- [ ] Premium upgrade flow (Stripe payments)
- [ ] OAuth callback integration for Calendly/Stripe/Cal.com
- [ ] Email/password auth
- [ ] Input validation (Zod)
- [ ] Error boundaries
- [ ] Tests
- [ ] Custom domain support (e.g., link.kaniel.dev)

## Files Reference
- `findings.md` - Detailed project analysis
- `progress.md` - Feature progress tracker
- `task_plan.md` - Implementation plan
