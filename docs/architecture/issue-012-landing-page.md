# Issue 012 — Landing Page

**Phase:** 2 — Landing + Admin  
**Depends on:** Issue 003  
**Branch:** `feature/issue-012-landing-page`

---

## Objective

Build the public-facing TracItAI landing page. Tone: honest golf-enthusiast — written for golfers who want real data about their own game, not marketing fluff.

---

## Acceptance Criteria

- [ ] Page renders at `/` without authentication
- [ ] Fully responsive — desktop, iPad, iPhone
- [ ] Two CTAs throughout: "Join the waitlist" (primary) and "Log in" (secondary)
- [ ] All sections below present and complete
- [ ] Page loads under 2 seconds — no heavy images, SVG or CSS visuals only
- [ ] Waitlist form embedded inline — no redirect for email capture
- [ ] Meta tags: title, description, og:title, og:description

---

## Page sections — in order

### 1. Navigation bar
- TracItAI logo (text-based, brand-green wordmark) left
- "Log in" button right (ghost style)
- Sticky on scroll

### 2. Hero
Headline: **Your game generates data. Most of it disappears.**

Subheadline: TracItAI combines your GoPro footage with Arccos shot data to give you real swing analysis and coaching insights — from your own rounds, on your own course, with your own clubs.

Primary CTA: "Join the waitlist →" (brand-green)
Secondary: "Learn how it works ↓" (ghost, scrolls to features)

### 3. The problem (3-column cards)
- **You record your swing** — Hours of GoPro footage. You watch it once. It goes nowhere.
- **Arccos tracks your shots** — GPS data, strokes gained, club distances. Rich data, no visual context.
- **Your coach sees you once a month** — Pattern recognition takes a season. Feedback is delayed by weeks.

### 4. How it works (numbered steps)
1. Upload your clips — drop GoPro footage, app matches clips to shot timeline automatically
2. CV does the analysis — ball flight traced, swing mechanics analyzed across both camera angles
3. Review and tag — auto-detected attributes confirmed, app learns with every correction
4. Spot what's actually happening — root causes surfaced, not just symptoms

### 5. Feature grid (2×3)
🎥 Dual-camera analysis | ⛳ Arccos integration | 🏌️ Ball flight tracing
🎤 Voice-to-metadata | 📈 Multi-round trends | 🏟️ Range + short game

### 6. Honest section — "What TracItAI is and isn't"
> **This is not Trackman.** TracItAI uses your GoPro cameras and computer vision. Less precise than a $30,000 launch monitor — and it travels with you, costs a fraction, and works on your actual course.

> **This is a builder's tool.** TracItAI is in early access. The core pipeline works. Rough edges exist. If you want a finished product, wait. If you want a serious self-coaching tool that improves every round, you're in the right place.

### 7. Waitlist signup (inline form)
Headline: **Get early access**
Body: We're opening TracItAI to a small group of golfers. Join the waitlist and we'll reach out when your spot is ready.
Fields: Name, Email, "What are you hoping to improve?" (optional, 280 char)
CTA: "Join the waitlist"
After submit: inline success — no page change

### 8. Footer
TracItAI © 2026 · Privacy Policy · Terms of Service (placeholder routes) · "Built by a golfer, for golfers."

---

## Notes for Claude Code

- Copy above is the actual copy — do not rewrite or improve without instruction
- Waitlist form calls `POST /api/auth/waitlist` (Issue 007)
- No stock photos, no Unsplash — CSS/SVG visuals only
- "Honest section" should feel visually distinct — different background, quote-block style
- Mobile: hero headline 2 lines max, feature grid 1 column
