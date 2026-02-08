# CLAUDE_STATE.md - LinkHub

> **Last Updated:** 2026-01-31
> **Branch:** main

---

## 📋 Project Overview

**LinkHub** is a link management and bio page platform built with Next.js 16. It allows users to create customizable link-in-bio pages with analytics, similar to Linktree but with enhanced features.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | Framework |
| React | 19.2.3 | UI Framework |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.29.2 | Animations |
| Supabase | 2.91.1 | Database & Auth |
| Radix UI | Various | UI Components |
| shadcn/ui | - | Component Library |
| Recharts | 3.7.0 | Analytics Charts |

---

## 📁 Project Structure

```
linkhub/
├── src/
│   └── app/           # Next.js App Router
├── public/            # Static assets
├── supabase/          # Supabase config
├── components.json    # shadcn/ui config
└── .env.local         # Environment variables
```

---

## 🚀 Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📊 Current Status

| Area | Status | Notes |
|------|--------|-------|
| Core UI | ✅ | Basic layout complete |
| Auth | 🔄 | Supabase integration |
| Database | 🔄 | Schema setup |
| Analytics | 📝 | Planned |
| Custom Domains | 📝 | Planned |

**Legend:** ✅ Complete | 🔄 In Progress | 📝 Planned

---

## 🎯 Immediate Goals

1. Complete user authentication flow
2. Build link management CRUD
3. Add analytics dashboard
4. Implement theme customization

---

## ⚠️ Known Issues

- None currently tracked

---

## 📝 Notes

- Uses Next.js 16 with App Router
- Supabase for backend (same instance as CRM)
- shadcn/ui for consistent component styling

---

*Update this file at the end of each development session.*
