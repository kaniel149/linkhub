/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║           LINKHUB — Celebrity Profile Template               ║
 * ║                                                               ║
 * ║  Use this template to create new demo profiles for            ║
 * ║  celebrities, athletes, influencers, etc.                     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 * ── HOW TO CREATE A NEW PROFILE ──
 *
 * 1. COPY THIS FILE → src/lib/demo-{slug}.ts
 * 2. EDIT the config below (profile, links, socials, services)
 * 3. ADD ASSETS to public/demo/{slug}/
 *    - avatar.png        (profile picture, 400x400+)
 *    - canvas images     (action photos, 1920px wide, landscape)
 *    - canvas video      (optional, 5-10s loop, 720p mp4, <4MB)
 * 4. OPTIONAL: Create custom background component
 *    → src/components/profile/{slug}-background.tsx
 * 5. REGISTER in src/app/[username]/page.tsx (see bottom of file)
 *
 * ── CONFIGURATION REFERENCE ──
 */

import { ProfileWithLinks, Service } from '@/lib/types/database'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. BASIC INFO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TEMPLATE_USERNAME = 'slug' // URL: /slug

export const templateProfile: ProfileWithLinks = {
  id: 'demo-slug-001',
  username: 'slug',
  display_name: 'Full Name',
  bio: 'Short bio — 1-2 lines max. Use emojis for visual pop.',
  avatar_url: '/demo/slug/avatar.png',

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. THEME — Visual identity
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  theme: {
    primaryColor: '#E03A3E',     // Brand/accent color (used for glows, borders, highlights)
    backgroundColor: '#050505',   // Page background (keep dark: #030712 to #0a0a0a)
    fontFamily: 'Plus Jakarta Sans', // Google font or 'inherit'
    buttonStyle: 'glass',        // 'glass' | 'solid' | 'outline' | 'soft'
  },

  /**
   * THEME EXAMPLES:
   * ─────────────────────────────────────────────
   * Sports (NBA):     '#E03A3E' (Blazers red)    bg '#050505'
   * Sports (Lakers):  '#552583' (Lakers purple)   bg '#050505'
   * Sports (Warriors):'#1D428A' (Warriors blue)   bg '#050505'
   * Tech/AI:          '#38bdf8' (Cyan)            bg '#030712'
   * Music:            '#1DB954' (Spotify green)   bg '#050505'
   * Fashion:          '#D4AF37' (Gold)            bg '#0a0a0a'
   * Gaming:           '#9146FF' (Twitch purple)   bg '#050505'
   * Finance:          '#00D632' (Money green)     bg '#030712'
   */

  is_premium: true,              // true = no "Made with LinkHub" footer + verified badge
  custom_domain: null,
  onboarding_completed_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. LINKS — Main content buttons (max ~6 for best UX)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  links: [
    {
      id: 'slug-link-1',
      profile_id: 'demo-slug-001',
      title: '🌟 Main Achievement / News',
      url: 'https://example.com',
      icon: '🌟',
      position: 0,
      is_active: true,
      click_count: 48200,         // Fake stats for demo
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'slug-link-2',
      profile_id: 'demo-slug-001',
      title: '🏀 Stats / Portfolio / Work',
      url: 'https://example.com',
      icon: '🏀',
      position: 1,
      is_active: true,
      click_count: 35800,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    // Add 3-6 links total...
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. SOCIAL LINKS — Icon bar below bio
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  social_embeds: [
    {
      id: 'slug-social-1',
      profile_id: 'demo-slug-001',
      platform: 'instagram',      // 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'github' | 'spotify'
      embed_url: 'https://www.instagram.com/username/',
      position: 0,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    // Add 3-5 socials...
  ],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. SERVICES — Business offerings (optional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const templateServices: Service[] = [
  {
    id: 'slug-service-1',
    profile_id: 'demo-slug-001',
    title: 'Service Name',
    description: 'What you offer, who it\'s for, why it\'s valuable.',
    category: 'consulting',       // 'consulting' | 'freelance' | 'product' | 'event' | 'education' | 'other'
    pricing: 'custom',            // 'free' | 'fixed' | 'hourly' | 'custom' | 'contact'
    price_amount: null,           // number or null (e.g., 450 for $450)
    price_currency: 'USD',
    action_type: 'contact_form',  // 'contact_form' | 'book_meeting' | 'request_quote' | 'buy_now' | 'external_link'
    action_config: {},
    position: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 6. CANVAS — Hero background (cinematic image slideshow + video)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Configured in src/app/[username]/page.tsx → DEMO_PROFILES
 *
 * OPTIONS (priority order — video > images > heroImage):
 *
 *   canvasVideo: '/demo/slug/canvas-clip.mp4'
 *   ├── 5-10 second loop, 720p, mp4, <4MB
 *   ├── CRF 20, tune film, -movflags +faststart
 *   ├── Starts playing AFTER canvasImages load (smooth crossfade)
 *   └── No audio (-an flag)
 *
 *   canvasImages: [
 *     '/demo/slug/action-1.jpg',    ← 1920px wide, landscape
 *     '/demo/slug/action-2.jpg',    ← 3-4 images ideal
 *     '/demo/slug/action-3.jpg',
 *     '/demo/slug/action-1.jpg',    ← can repeat for longer cycle
 *   ]
 *   ├── Crossfade slideshow, 4 seconds per image
 *   ├── Ken Burns effect (zoom + pan per image)
 *   ├── objectPosition: 'center 35%' (shows upper body/face)
 *   ├── filter: brightness(0.45) saturate(1.6)
 *   └── Falls back to avatar blur if no images
 *
 *   heroImage: '/demo/slug/hero.jpg'
 *   ├── Single image with CSS drift animation (20s loop)
 *   └── Blurred background (fallback when no canvas)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 7. CUSTOM BACKGROUND — Full-page animated background (optional)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Create: src/components/profile/{slug}-background.tsx
 *
 * AVAILABLE EFFECTS (mix and match):
 *   • CursorSpotlight   — Mouse-following radial gradient (desktop) / auto-drift (mobile)
 *   • JerseyWatermark    — Giant text/number (50vh) with animated gradient fill
 *   • GradientMesh       — 6 animated blobs with mix-blend-mode: screen
 *   • EmberParticles     — Rising fire-like particles (30 desktop / 15 mobile)
 *   • CourtLines         — SVG sport-specific patterns with pulsing opacity
 *   • Noise texture      — SVG fractalNoise overlay
 *
 * BACKGROUND THEMES:
 *   • Basketball: court lines + ember particles + jersey number
 *   • Football:  field lines + confetti particles + jersey number
 *   • Music:     equalizer bars + vinyl record + floating notes
 *   • Tech:      circuit board + floating nodes + connection lines
 *   • Fashion:   fabric texture + sparkle particles + brand logo
 *
 * If no customBackground → default AnimatedBackground (gradient mesh)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 8. REGISTRATION — Wire it up in page.tsx
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * In src/app/[username]/page.tsx add:
 *
 * import { templateProfile, templateServices, TEMPLATE_USERNAME } from '@/lib/demo-slug'
 * import { SlugBackground } from '@/components/profile/slug-background' // optional
 *
 * Then add to DEMO_PROFILES:
 *
 *   [TEMPLATE_USERNAME]: {
 *     profile: templateProfile,
 *     services: templateServices,
 *     canvasVideo: '/demo/slug/canvas-clip.mp4',         // optional
 *     canvasImages: [                                      // recommended
 *       '/demo/slug/action-1.jpg',
 *       '/demo/slug/action-2.jpg',
 *       '/demo/slug/action-3.jpg',
 *       '/demo/slug/action-1.jpg',
 *     ],
 *     customBackground: <SlugBackground />,                // optional
 *   },
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 9. ASSETS CHECKLIST
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * public/demo/{slug}/
 *   ├── avatar.png               (400x400+, profile picture)
 *   ├── action-1.jpg             (1920px wide, landscape, action shot)
 *   ├── action-2.jpg             (1920px wide, landscape, action shot)
 *   ├── action-3.jpg             (1920px wide, landscape, action shot)
 *   └── canvas-clip.mp4          (720p, 5-10s, <4MB, no audio)
 *
 * FFMPEG COMMANDS:
 *   # Trim video (start at Xs, duration Ys):
 *   ffmpeg -i source.mp4 -ss X -t Y -an -c:v libx264 -crf 20 \
 *     -preset slow -movflags +faststart -tune film output.mp4
 *
 *   # Download from YouTube:
 *   yt-dlp -f "bestvideo[height<=720]" -o output.mp4 "YOUTUBE_URL"
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 10. EXISTING PROFILES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * /kaniel  — Kaniel Tordjman (tech/entrepreneur)
 *            Theme: cyan #38bdf8, bg #030712
 *            Canvas: 3 professional photos (slideshow)
 *            Background: default AnimatedBackground
 *
 * /deni    — Deni Avdija (NBA All-Star)
 *            Theme: red #E03A3E, bg #050505
 *            Canvas: 3 HD action photos + 8s dunk video
 *            Background: custom DeniBackground (court lines,
 *                         ember particles, jersey #8, spotlight)
 */
