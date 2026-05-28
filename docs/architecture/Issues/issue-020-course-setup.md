# Issue 020 — Course Setup — Scorecard Pull + Manual Entry + Tee Management

**Phase:** 4 — Course Library  
**Depends on:** Issue 019  
**Branch:** `feature/issue-020-course-setup`

---

## Objective

Build the course setup flow: search Golf Intelligence, pull scorecard, save to DB, and allow full manual entry for courses not in the database.

---

## Acceptance Criteria

- [ ] `/courses/new` renders course search with Golf Intelligence results
- [ ] Selecting a result pulls and saves the full scorecard (all tees + holes)
- [ ] User can review and edit any hole before saving
- [ ] "Course not found" path: full manual entry (name, city, state, holes with par + yards per hole)
- [ ] Tee box management: add, rename, delete tees (minimum 1 required)
- [ ] Saves to DB and redirects to `/courses/[id]`
- [ ] Duplicate detection: if course name + city already in DB, warn before saving
- [ ] `trackEvent('course.api_lookup')` when Golf Intelligence called
- [ ] `trackEvent('course.manual_entry')` when manual path used

---

## Course setup flow

**Step 1: Search**
```
Input: "Meadow Springs"
→ Results with "Use this course" per result
→ "Enter manually" option at bottom
```

**Step 2a: Review pulled scorecard**
```
Course name (editable), City/State (editable)
Select tee: ○ Black ○ Blue ● White ○ Red
Hole preview table: Hole | Par | Yards | HCP
[Edit any hole]  [Save course →]
```

**Step 2b: Manual entry**
```
Course name, City, State, Country
Tee name, Color, Total yards (optional), Rating, Slope
Holes 1–18: Par (required), Yards, HCP (optional)
[+ Add another tee box]
[Save course →]
```

---

## API specs

### POST /api/courses (from Golf Intelligence)
```typescript
{ giId: string, selectedTees?: string[] }
// 201
{ course: { id, name, city, state, tees: [...] } }
```

### POST /api/courses/manual
```typescript
{
  name: string, city: string, state: string, country?: string
  tees: Array<{
    name: string, color?: string, totalYards?: number, courseRating?: number, slopeRating?: number
    holes: Array<{ number: number, par: number, yards?: number, handicapIndex?: number }>
  }>
}
// 201
{ course: { id, name, city, state, tees: [...] } }
```

### PUT /api/courses/[id]/holes/[holeId]
```typescript
{ par?: number, yards?: number, handicapIndex?: number }
// 200
{ hole: { ... } }
```
