# TASK-004 — Dashboard Visual Overhaul
**Assignee:** Socio2 (Maestro Mason)  
**Priority:** High  
**Goal:** Make the dashboard look and feel premium — dark, polished, animated, professional.

---

## Stack (do not change)
- React 18 + Vite
- Supabase JS (auth + realtime already wired)
- Lucide React (icons already installed)
- CSS variables in `src/styles/index.css` (extend, don't replace)

## Install these packages
```bash
npm install recharts framer-motion
```

---

## 1. Layout — Sidebar navigation
**File:** `src/components/Layout.jsx`

Replace the current tab bar with a **fixed left sidebar** (240px wide):
- Logo + project name at top
- Nav links: Overview, Tasks, Skills, Sessions
- User info + sign out at bottom
- Collapse to icon-only on mobile (hamburger)
- Active link highlighted with `var(--accent)` left border + bg

Main content area: `margin-left: 240px`, full height scroll.

---

## 2. Overview page (new section)
**File:** `src/sections/Overview.jsx`

A hero section with 4 KPI cards in a row:
```
[ Total Tasks ] [ Open Tasks ] [ Skills Detected ] [ Sessions Logged ]
```
Each card:
- Large number (animated count-up on mount with framer-motion)
- Subtitle label
- Subtle icon (lucide)
- Colored left border accent (accent / success / purple / warning)

Below the cards: a **mini activity feed** — last 5 events pulled from sessions and tasks combined, sorted by date. Each event is one line: icon + text + relative date ("2 days ago").

---

## 3. Skills — Bar chart
**File:** `src/sections/Skills.jsx`

Add a `<BarChart>` (Recharts) above the existing skill list:
- X axis: skill names (truncated to 18 chars)
- Y axis: autonomy level (high=3, medium=2, low=1)
- Bars colored by human: Socio1 = `var(--accent)`, Socio2 = `var(--purple)`
- Tooltip showing full skill name + evidence
- Animated on mount (`isAnimationActive`)

Keep the existing skill rows below the chart.

---

## 4. Sessions — Timeline
**File:** `src/sections/Sessions.jsx`

Replace the current card list with a **vertical timeline**:
- Left: vertical line (`var(--border)`)
- Each session: circle dot on the line + card to the right
- Card shows: date, duration badge, tasks completed (pill list), skills observed
- Animate in with framer-motion `staggerChildren` (0.05s delay each)
- Most recent session at top with `var(--accent)` dot, others `var(--border)`

---

## 5. Tasks — Status columns
**File:** `src/sections/Tasks.jsx`

Change from stacked list to **2-column kanban** on desktop (≥768px):
- Column 1: `in_progress` + `pending`
- Column 2: `completed` + `cancelled`
- Each card: drag is NOT required, just visual columns
- Preserve the expand-to-show-steps feature (already built)
- Add a subtle `box-shadow` glow on `in_progress` cards: `0 0 0 1px var(--accent)` + `var(--accent-dim)` background

---

## 6. Card & Global polish
**File:** `src/styles/index.css`

Add / update:
```css
/* Glassmorphism card variant */
.card-glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.07);
}

/* Animated gradient border on hover */
.card:hover {
  border-color: var(--border-light);
  transition: border-color 0.2s ease;
}

/* Pulse for realtime dot */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.realtime-dot { animation: pulse 2s infinite; }

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, var(--bg-1) 25%, var(--bg-2) 50%, var(--bg-1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Replace all hardcoded `setLoading` spinners with skeleton placeholders matching the shape of the content.

---

## 7. Framer Motion — page transitions
**File:** `src/components/Layout.jsx`

Wrap each section in:
```jsx
import { AnimatePresence, motion } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={activeSection}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15 }}
  >
    {/* section content */}
  </motion.div>
</AnimatePresence>
```

---

## 8. Mobile responsive
- Sidebar collapses to bottom nav bar on `< 768px`
- KPI cards stack to 2×2 grid
- Kanban columns stack vertically
- Chart scrollable horizontally on small screens

---

## Definition of Done
- [ ] Sidebar navigation working on desktop + mobile
- [ ] Overview page with KPI cards + activity feed
- [ ] Skills bar chart renders with Recharts
- [ ] Sessions timeline with stagger animation
- [ ] Tasks in 2-column kanban (in_progress glow)
- [ ] Skeleton loaders on all sections
- [ ] Page transitions with framer-motion
- [ ] Build passes: `npm run build`
- [ ] No console errors

## Deploy
CI/CD is already configured. Just push to `main` — GitHub Actions auto-deploys to Vercel.

```bash
git add src/dashboard/
git commit -m "feat: dashboard visual overhaul TASK-004"
git push
```
