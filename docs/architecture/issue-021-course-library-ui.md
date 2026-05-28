# Issue 021 — Course Library UI + Hole Override Per Session

**Phase:** 4 — Course Library  
**Depends on:** Issue 020  
**Branch:** `feature/issue-021-course-library-ui`

---

## Objective

Build the course library browse page, course detail view, and the per-session hole override mechanism for temporary conditions.

---

## Acceptance Criteria

- [ ] `/courses` lists all saved courses with search/filter
- [ ] `/courses/[id]` shows full scorecard with all tees and holes
- [ ] Course detail allows permanent edits to any hole
- [ ] "Add tee box" on course detail
- [ ] Session hole override: when creating a round, user can flag any hole for that session
- [ ] Override types: `tee_under_repair`, `temporary_green`, `pin_not_in_normal_position`, `hole_closed`, `custom_note`
- [ ] Overrides stored per-session — do not modify cached course data
- [ ] Course library shows: name, city, tee count, date added, "Use in round" button

---

## Course library page — /courses

```
My Courses                              [+ Add course]
Search: [____________________]

Meadow Springs Golf Club               [Use in round →]
Kennewick, WA · 4 tees · Added Mar 2026

Canyon Lakes Golf Course               [Use in round →]
Kennewick, WA · 2 tees · Added Apr 2026
```

---

## Course detail page — /courses/[id]

```
Meadow Springs Golf Club               [Edit name] [Delete]
Kennewick, WA
Tees: [White ▼]    [+ Add tee]

Hole  Par  Yards  HCP
1     4    412    7      [Edit]
...
Total 72   6,412

[Use this course in a new round →]
```

---

## Session hole override UI

During round creation, collapsible "Hole conditions" section. Holes with overrides show ✱ indicator. Tapping a hole opens:

```
○ Tee under repair
○ Temporary green
○ Pin not in normal position
○ Hole closed (mark as N/A)
● Custom note: [_____________]
[Save]
```

---

## API specs

### GET /api/courses
```typescript
{ courses: Array<{ id, name, city, state, teeCount, createdAt }> }
```

### GET /api/courses/[id]
```typescript
{ course: { id, name, city, state, isManuallyEntered, tees: Array<{ id, name, color, totalYards, rating, slope, holes: [...] }> } }
```

### POST /api/sessions/[id]/hole-overrides
```typescript
{ overrides: Array<{ holeNumber: number, type: string, note?: string }> }
// 200
{ session: { id, overrides: [...] } }
```
