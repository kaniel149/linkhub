# LinkHub - Task Plan / תכנית משימות

## Priority Levels / רמות עדיפות
- **P0** - Critical / קריטי
- **P1** - High Priority / עדיפות גבוהה
- **P2** - Medium Priority / עדיפות בינונית
- **P3** - Nice to Have / נחמד שיהיה

---

## Phase 1: Complete Core Features / השלמת פיצ'רים בסיסיים

### P0 - Critical Missing Pages / עמודים קריטיים חסרים

#### Task 1.1: Appearance Page / עמוד עיצוב
**File:** `/src/app/(dashboard)/dashboard/appearance/page.tsx`
**Description:** Create UI for theme customization
**Subtasks:**
- [ ] Color picker for primary color
- [ ] Color picker for background color
- [ ] Button style selector (solid/outline/glass/soft)
- [ ] Font family selector
- [ ] Live preview component
- [ ] Save to Supabase

**Estimated Time:** 3-4 hours

---

#### Task 1.2: Settings Page / עמוד הגדרות
**File:** `/src/app/(dashboard)/dashboard/settings/page.tsx`
**Description:** User profile and account settings
**Subtasks:**
- [ ] Username editing (with availability check)
- [ ] Display name editing
- [ ] Bio editing
- [ ] Avatar upload (Supabase Storage)
- [ ] Account deletion option

**Estimated Time:** 3-4 hours

---

#### Task 1.3: Social Embeds Page / עמוד הטמעות חברתיות
**File:** `/src/app/(dashboard)/dashboard/social/page.tsx`
**Description:** Manage social media embeds
**Subtasks:**
- [ ] Add embed form (platform selector + URL)
- [ ] List existing embeds
- [ ] Toggle active/inactive
- [ ] Delete embed
- [ ] Reorder embeds

**Estimated Time:** 2-3 hours

---

### P1 - Important Enhancements / שיפורים חשובים

#### Task 1.4: Drag & Drop Links / גרור ושחרר קישורים
**Files:**
- `/src/components/dashboard/links-manager.tsx`
- `/src/app/api/links/reorder/route.ts`
**Description:** Enable drag-and-drop reordering
**Library:** `@dnd-kit/core` or `react-beautiful-dnd`
**Subtasks:**
- [ ] Install DnD library
- [ ] Wrap links in DnD context
- [ ] Handle position updates
- [ ] Create reorder API endpoint
- [ ] Optimistic UI updates

**Estimated Time:** 3-4 hours

---

#### Task 1.5: Live Preview Enhancement / שיפור תצוגה מקדימה
**File:** `/src/components/dashboard/live-preview.tsx`
**Description:** Real-time preview of profile while editing
**Subtasks:**
- [ ] Create preview component
- [ ] Sync with links state
- [ ] Sync with theme state
- [ ] Add to dashboard sidebar/modal

**Estimated Time:** 2-3 hours

---

## Phase 2: Authentication & Security / אימות ואבטחה

### P1 - Security Improvements / שיפורי אבטחה

#### Task 2.1: Enable Middleware / הפעלת Middleware
**File:** `/src/middleware.ts` (rename from .bak)
**Description:** Restore and configure auth middleware
**Subtasks:**
- [ ] Rename middleware.ts.bak to middleware.ts
- [ ] Configure protected routes
- [ ] Handle auth redirects
- [ ] Test all routes

**Estimated Time:** 1-2 hours

---

#### Task 2.2: Input Validation / ולידציית קלט
**Library:** Zod
**Description:** Add server-side validation
**Subtasks:**
- [ ] Install Zod
- [ ] Create validation schemas
- [ ] Validate in API routes
- [ ] Return proper error messages

**Estimated Time:** 2-3 hours

---

## Phase 3: Premium Features / פיצ'רים פרימיום

### P2 - Monetization / מונטיזציה

#### Task 3.1: Payment Integration / אינטגרציית תשלומים
**Library:** Stripe
**Description:** Premium subscription flow
**Subtasks:**
- [ ] Stripe setup
- [ ] Pricing page
- [ ] Checkout flow
- [ ] Webhook handling
- [ ] Update is_premium flag

**Estimated Time:** 6-8 hours

---

#### Task 3.2: Custom Domain Support / תמיכה בדומיין מותאם
**Description:** Allow premium users to use custom domains
**Subtasks:**
- [ ] Domain verification API
- [ ] DNS instructions UI
- [ ] Middleware for custom domains
- [ ] SSL/Certificate handling

**Estimated Time:** 8-10 hours

---

## Phase 4: UX Improvements / שיפורי חווית משתמש

### P2 - Polish / ליטוש

#### Task 4.1: Loading States / מצבי טעינה
**Description:** Add skeleton loaders and loading indicators
**Subtasks:**
- [ ] Dashboard loading skeleton
- [ ] Profile page loading
- [ ] API call indicators
- [ ] Optimistic updates

**Estimated Time:** 2-3 hours

---

#### Task 4.2: Error Handling / טיפול בשגיאות
**Description:** Improve error UX
**Subtasks:**
- [ ] Error boundaries
- [ ] Error pages (404, 500)
- [ ] Toast notifications for errors
- [ ] Retry mechanisms

**Estimated Time:** 2-3 hours

---

#### Task 4.3: Mobile Optimization / אופטימיזציה למובייל
**Description:** Improve mobile experience
**Subtasks:**
- [ ] Dashboard mobile layout
- [ ] Touch-friendly interactions
- [ ] Mobile navigation

**Estimated Time:** 2-3 hours

---

## Phase 5: Testing & Deployment / בדיקות ופריסה

### P3 - Quality Assurance / הבטחת איכות

#### Task 5.1: Unit Tests / בדיקות יחידה
**Library:** Vitest + Testing Library
**Subtasks:**
- [ ] Setup testing environment
- [ ] Test utility functions
- [ ] Test UI components
- [ ] Test API routes

**Estimated Time:** 4-6 hours

---

#### Task 5.2: E2E Tests / בדיקות קצה לקצה
**Library:** Playwright
**Subtasks:**
- [ ] Setup Playwright
- [ ] Auth flow tests
- [ ] Link management tests
- [ ] Profile page tests

**Estimated Time:** 4-6 hours

---

## Summary / סיכום

| Phase | Tasks | Est. Hours |
|-------|-------|------------|
| Phase 1 | Core Features | 13-18 |
| Phase 2 | Auth & Security | 3-5 |
| Phase 3 | Premium | 14-18 |
| Phase 4 | UX | 6-9 |
| Phase 5 | Testing | 8-12 |
| **Total** | | **44-62 hours** |

---

## Next Steps / צעדים הבאים

1. Start with **Task 1.1** (Appearance Page) - highest impact
2. Then **Task 1.2** (Settings Page) - essential for users
3. Enable **Task 2.1** (Middleware) - security fix
4. Continue with remaining Phase 1 tasks

---

## Notes / הערות

- All estimates assume familiarity with the codebase
- Times may vary based on design requirements
- Some tasks can be parallelized
- Consider creating issues/tickets for each task
