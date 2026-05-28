# Issue 051 — Mobile UX Pass

**Phase:** 11 — Polish  
**Depends on:** All previous phases  
**Branch:** `feature/issue-051-mobile-ux`

---

## Objective

Full audit and fix of mobile experience. Test on iPhone viewport (390px width). Every feature must work one-handed.

---

## Acceptance Criteria

- [ ] All interactive elements minimum 44px tap target
- [ ] Shot entry form: one-thumb operation on iPhone
- [ ] Club picker: scroll-friendly, large enough to tap without zoom
- [ ] Tag pills: large enough to tap accurately
- [ ] Video player: fullscreen works on iOS Safari
- [ ] Bottom tab bar: functional and correct on all iPhone sizes
- [ ] Hole view shot list: cards don't overflow on 390px
- [ ] Scorecard: horizontal scroll on mobile for 18-hole grid
- [ ] Clarification queue: angle/hole buttons large enough to tap
- [ ] No horizontal scroll on any non-scorecard page
- [ ] Trends charts: readable on mobile (simplified axis labels)

---

## Test checklist (run on 390px viewport)

- [ ] Landing page — hero readable, CTA tappable, form usable
- [ ] Login — inputs not zoomed-in on focus (font-size ≥16px on inputs)
- [ ] Dashboard — quick action cards tappable, session list readable
- [ ] Round creation — all steps navigable
- [ ] Shot entry form — all controls one-thumb accessible
- [ ] Round view — scorecard scrolls horizontally, hole list readable
- [ ] Clip import — file picker works, tabs tappable
- [ ] Shot detail — video player controls usable, tags tappable
- [ ] Trends — charts readable, filter pills tappable

---

## Notes for Claude Code

- iOS Safari input zoom prevention: `font-size: 16px` minimum on all `<input>` and `<select>`
- Touch targets: use `min-h-[44px] min-w-[44px]` Tailwind classes on all interactive elements
- Test with browser DevTools mobile simulation AND actual scroll/tap behavior
