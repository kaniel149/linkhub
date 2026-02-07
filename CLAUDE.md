# LinkHub - Claude Instructions

## Project Overview
LinkHub is a "link-in-bio" application similar to Linktree. Users create personalized pages with all their important links in one place.

## Current State (2026-02-07)

### 🚀 Deployed to Production
- **URL**: https://linkhub-iota-red.vercel.app
- **Demo Profile**: https://linkhub-iota-red.vercel.app/kaniel
- **GitHub**: https://github.com/kaniel149/linkhub
- **Hosting**: Vercel (auto-deploys from main branch)

### Latest Session - Dual-Interface Architecture (Phase 1 + 2)

**"The link-in-bio that AI agents can read and act on."** — Added a complete agent-readable layer to LinkHub.

#### Phase 1: Agent-Readable Layer (Complete)

1. **JSON-LD Structured Data** (`src/components/profile/json-ld.tsx`)
   - Schema.org `ProfilePage` + `Person` injected into every profile's `<head>`
   - Includes sameAs (social links), image, description
   - Added to both demo and real profiles in `[username]/page.tsx`

2. **Public Profile API** (`src/app/api/profiles/[username]/route.ts`)
   - Unauthenticated JSON endpoint for any profile
   - Returns: profile info, links, social, stats, `_meta` navigation block
   - Strips internal IDs, adds Cache-Control headers
   - Supports demo profile (kaniel) without Supabase

3. **llms.txt** (`src/app/llms.txt/route.ts`)
   - Plain-text markdown describing how AI agents should interact with LinkHub
   - Documents all API endpoints, content negotiation, examples

4. **Content Negotiation** (`src/middleware.ts`)
   - When `Accept: application/json` hits `/{username}`, rewrites to `/api/profiles/{username}`
   - Smart path detection (skips reserved paths like api/, dashboard/, etc.)

5. **DB Migration** (`supabase/migrations/002_agent_features.sql`)
   - `agent_visits` table for tracking AI agent access
   - Expanded analytics event types to include `agent_visit`, `agent_api_call`
   - Updated social_embeds platform check to include linkedin + github
   - RLS policies for agent_visits

#### Phase 2: Agent API & Analytics (Complete)

1. **OpenAPI 3.1 Spec** (`src/app/api/openapi.json/route.ts`)
   - Full machine-readable API spec for all public endpoints
   - Proper schemas for Profile, Link, Social, AgentCard responses

2. **Agent Card** (`src/app/api/profiles/[username]/card/route.ts`)
   - Compact "business card for AI agents" — fast, self-describing JSON
   - Contains identity, reach stats, links, social, capabilities, endpoint URLs

3. **Agent Detection** (`src/lib/agent-detection.ts`)
   - Detects Claude, ChatGPT, Perplexity, Google AI, Bing AI, Meta AI, Apple AI, Cohere
   - User-agent parsing with identifier + friendly name

4. **Agent Analytics**
   - Profile API tracks agent visits (fire-and-forget to agent_visits table)
   - Analytics stats API returns agentVisits, agentBreakdown, agentTimeline
   - Dashboard shows "AI Agent Activity" section with agent type breakdown + timeline chart
   - Only shown when agent visits > 0

5. **Types Updated** (`src/lib/types/database.ts`)
   - `AgentVisit` interface
   - `AnalyticsEvent.event_type` includes agent types
   - `PLAN_LIMITS` expanded with `maxServices`, `maxApiKeys`, `agentAnalytics`

#### New API Endpoints:
- `GET /api/profiles/{username}` — Full profile JSON
- `GET /api/profiles/{username}/card` — Compact agent card
- `GET /api/openapi.json` — OpenAPI 3.1 spec
- `GET /llms.txt` — AI agent instructions
- `GET /{username}` with `Accept: application/json` — Content negotiation

#### Build Status: ✅ `npm run build` passes cleanly (2.8s compile)

#### ⏭️ Next Steps (Phase 3-5):
1. **Run migration** — Execute `002_agent_features.sql` on Supabase
2. **Deploy** — `git push` to trigger Vercel deploy
3. **Verify** — `curl -H "Accept: application/json" https://linkhub-iota-red.vercel.app/kaniel`
4. **Phase 3: Services & Actions** — services table, dashboard CRUD, public profile section, inquiry system
5. **Phase 4: MCP Gateway** — JSON-RPC 2.0 MCP server per user, API keys, tool definitions
6. **Phase 5: Service Marketplace** — Calendly/Stripe/webhook integrations, premium gating

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

### Previous Session - Full Product Polish with Agent Team

**4 parallel agents** completed a comprehensive product polish:

#### What was built:

**1. Landing Page - Complete Overhaul:**
- **Hero section** - "All Your Links. One Stunning Page." headline with animated text rotation, 3D phone mockup, count-up stats, scroll-aware navbar
- **How It Works** section - 3 animated step cards (Sign Up → Add Links → Go Live)
- **Pricing** section - Free vs Pro ($9/mo or $7/mo annual) with toggle
- **Footer** - 4-column grid, social icons, gradient top border

**2. Drag & Drop Link Reordering:**
- @dnd-kit/core integration, drag handles, keyboard accessibility
- Optimistic UI + Supabase save, `/api/links/reorder` endpoint

#### Build Status: ✅ `npm run build` passes cleanly

### Working Features
- Landing page (hero, how it works, features, pricing, footer)
- OAuth authentication (Google, GitHub, Apple)
- Dashboard with links management (CRUD + drag & drop reorder)
- Analytics page with charts
- Appearance page (theme customization)
- Social embeds page
- Settings page (profile editing)
- Public profile pages (`/[username]`)
- Demo profile at `/kaniel` with real data
- Auth middleware protecting dashboard routes

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
- analytics_events (page views, clicks)

## Environment Variables
See `.env.local` for required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Key Files
- `src/lib/demo-data.ts` - Demo profile data for /kaniel
- `src/lib/motion.ts` - Complete animation system (tokens, springs, variants)
- `src/components/landing/` - hero, how-it-works, features, pricing, footer, navbar
- `src/components/profile/` - profile-page, link-button, social-bar, animated-background
- `src/components/dashboard/` - links-manager (with DnD), link-card, sidebar, etc.
- `public/demo/` - Optimized avatar images + OG image

## Remaining Tasks
- [x] Deploy to production ✅ (https://linkhub-iota-red.vercel.app)
- [ ] **Self-service flow** — users sign up, upload photo, add links, build their own style
- [ ] Premium upgrade flow (Stripe payments)
- [ ] Email/password auth
- [ ] Input validation (Zod)
- [ ] Error boundaries
- [ ] Tests
- [ ] Custom domain support (e.g., link.kaniel.dev)

## Files Reference
- `findings.md` - Detailed project analysis
- `progress.md` - Feature progress tracker
- `task_plan.md` - Implementation plan
