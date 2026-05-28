# Issue 017 — AppShell Navigation + Mobile Responsiveness

**Phase:** 3 — Core UI Shell  
**Depends on:** Issue 016  
**Branch:** `feature/issue-017-navigation`

---

## Objective

Complete the AppShell navigation with full mobile support across desktop, tablet, and iPhone.

---

## Acceptance Criteria

- [ ] Desktop (≥1024px): persistent left sidebar
- [ ] Tablet (768–1023px): collapsible sidebar, hamburger toggle
- [ ] Mobile (<768px): bottom tab bar for primary nav items
- [ ] Active route highlighted in nav
- [ ] User menu: avatar/initials, name, email, Settings link, Logout
- [ ] Admin users see "Admin" nav section
- [ ] Logo links to `/dashboard`

---

## Desktop sidebar nav items

```
TracItAI logo

PLAY
  Dashboard
  New Round
  My Rounds

ANALYSE
  Import Clips
  Trends

PRACTICE
  Range Sessions
  Short Game

COURSES
  My Courses
  Add Course

---
ADMIN (admin role only)
  Console · Users · Waitlist · Telemetry

---
[User avatar + name]
  Settings · Logout
```

---

## Mobile bottom tab bar (primary items)

```
[Dashboard] [Rounds] [Import] [Trends] [More...]
```

"More..." opens a slide-up sheet with remaining items.

---

## Notes for Claude Code

- Tailwind responsive prefixes: `hidden lg:block` sidebar, `lg:hidden` mobile nav
- Sidebar collapsed/expanded state persisted in localStorage
- Active state: match `useLocation()` pathname prefix
- No external navigation library
