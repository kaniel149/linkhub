# LinkHub - Claude Instructions

## Project Overview
LinkHub is a "link-in-bio" application similar to Linktree. Users create personalized pages with all their important links in one place.

## Current State (2026-02-07)

### Latest Session - Premium Profile Redesign (link.me style)

**"Holographic Tech Luminary" aesthetic** — inspired by link.me, redesigned to premium level:

#### Profile Page Redesign:
- **Hero banner** — clean professional portrait (`hero-clean-1200.png`) with parallax scrolling + gradient fade into dark background
- **Avatar** — AI neural network photo (`hero-400.png`) with conic gradient rotating ring (cyan glow)
- **Floating particle nodes** — 14 animated dots floating around the page
- **Stats bar** — 12.4K views, 3,829 clicks, 6 links (pill-shaped with glass effect)
- **Glass-morphism link cards** — left accent line on hover, click counts, arrow icons
- **Social bar** — proper SVG icons (X, Instagram, YouTube, GitHub) with spring animations
- **Share button** — floating top-right with native share API / clipboard fallback
- **"Create your page — it's free" CTA** at bottom
- **Stagger entrance animations** — blur + fade up with spring physics
- **Color theme** — electric cyan (#38bdf8) on near-black (#030712)
- **Font** — Plus Jakarta Sans

#### Image Setup:
- `hero-clean-1200.png` (1MB) — clean portrait as hero banner
- `hero-400.png` (140KB) — AI neural network photo as circular avatar
- `clean-800.png` (475KB), `hero-800.png` (531KB) — source photos
- avatar-400/200/64.png + WebP versions for optimized loading

#### Technical Notes:
- All motion components use `m` from `motion/react` (NOT `motion` from `framer-motion`) — LazyMotion strict mode requirement
- Server/Client boundary: no function props passed from Server Components
- Demo profile at `/kaniel` renders static data (no Supabase needed)

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
- [ ] Premium upgrade flow (Stripe payments)
- [ ] Email/password auth
- [ ] Input validation (Zod)
- [ ] Error boundaries
- [ ] Tests
- [ ] Custom domain support
- [ ] Deploy to production

## Files Reference
- `findings.md` - Detailed project analysis
- `progress.md` - Feature progress tracker
- `task_plan.md` - Implementation plan
