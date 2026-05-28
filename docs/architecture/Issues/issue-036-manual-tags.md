# Issue 036 — Manual Tag Panel + Note Entry + Learning Loop

**Phase:** 7 — Shot Review  
**Depends on:** Issue 035  
**Branch:** `feature/issue-036-manual-tags`

---

## Objective

Build the manual tag addition panel and note entry. All manual confirmations feed the learning loop that improves future auto-detection.

---

## Acceptance Criteria

- [ ] Tag categories: Ball flight, Swing feel, Situation, Quality
- [ ] Tags as toggleable pills — tap to add, tap again to remove
- [ ] Free-text note field: 280 char limit, saves on blur
- [ ] Tags persist immediately on toggle (optimistic update)
- [ ] Recently used tags shown first within each category
- [ ] Custom tag: user can type a tag not in the predefined list
- [ ] Summary line updates live as tags are toggled

---

## Tag taxonomy

**Ball flight & contact**
`pure` `thin` `fat` `toe` `heel` `topped` `pull` `push` `draw` `fade` `hook` `slice` `high` `low`

**Swing feel**
`over_the_top` `early_release` `came_off_it` `rushed` `hung_back` `committed` `decelerated` `great_tempo` `smooth`

**Situation**
`into_wind` `downwind` `crosswind` `uphill_lie` `downhill_lie` `sidehill` `rough` `wet` `cold` `pressure`

**Quality**
`great_shot` `good_shot` `acceptable` `mishit` `unacceptable`

---

## API specs

### POST /api/shots/[id]/tags
```typescript
{ tagCategory: string, tagKey: string, tagValue: string, source: 'user' }
// 201
{ tag: { id, tagCategory, tagKey, tagValue, source } }
```

### DELETE /api/shot-tags/[id]
```typescript
// 204
```

### PUT /api/shots/[id]/notes
```typescript
{ notes: string }
// 200
{ shot: { id, notes } }
```
