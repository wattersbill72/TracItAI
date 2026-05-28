# Issue 035 — Auto-Detected Tag Panel

**Phase:** 7 — Shot Review  
**Depends on:** Issue 034  
**Branch:** `feature/issue-035-auto-tag-panel`

---

## Objective

Build the auto-detected swing attribute panel: CV and voice/Nova detected attributes with confidence indicators, source badges, and accept/reject controls.

---

## Acceptance Criteria

- [ ] Tags grouped by category: ball flight, setup, mechanics
- [ ] Each tag: attribute name, measured value, source badge, confidence bar, accept/reject buttons
- [ ] Confidence color: ≥75% green, 50–74% amber, <50% red
- [ ] Source badges: DTL (teal), Face-on (purple), Ball flight (blue), Voice (amber)
- [ ] Accepted tags persist with `user_confirmed = true`
- [ ] Rejected tags persist with `user_confirmed = false`
- [ ] "Accept all" button
- [ ] Pending count shown in section header
- [ ] Summary bar shows accepted tags after review
- [ ] `trackEvent('tag.confirmed')` and `trackEvent('tag.rejected')`

---

## Row layout

```
[Attribute name] [Measured value] [Source badge] [Conf bar] [%] [✓] [✕]

Accepted row: green background tint, name turns green
Rejected row: dimmed, dashed border
```

---

## API specs

### PUT /api/shot-tags/[id]
```typescript
{ userConfirmed: boolean }
// 200
{ tag: { id, userConfirmed } }
```

### POST /api/shot-tags/bulk-confirm
```typescript
{ tagIds: string[], userConfirmed: boolean }
// 200
{ updated: number }
```
