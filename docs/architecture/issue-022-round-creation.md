# Issue 022 — Round Creation Flow

**Phase:** 5 — Round + Shot Entry  
**Depends on:** Issue 021  
**Branch:** `feature/issue-022-round-creation`

---

## Objective

Build the new round creation flow: course/tee selection, round metadata, camera setup, and hole conditions.

---

## Acceptance Criteria

- [ ] `/rounds/new` stepped form guides round creation
- [ ] Step 1: Course selection — search existing or add new
- [ ] Step 2: Tee selection + date + weather + wind
- [ ] Step 3: Camera setup (cameras in use today, sync reminder)
- [ ] Step 4: Hole conditions (optional, skippable)
- [ ] Step 5: Review + create
- [ ] Created round redirects to `/rounds/[id]`
- [ ] Round date defaults to today, can be changed for backdating
- [ ] `trackEvent('round.created')` on success

---

## Steps

### Step 1: Course
Recent courses shown with quick-select. Search and "Add new course" option.

### Step 2: Round details
```
Tee: ● White ○ Blue ○ Black ○ Red
Date: [May 25, 2026]
Weather: ○ Clear ● Partly cloudy ○ Overcast ○ Rainy
Temp (°F): [72]
Wind: [free text, optional]
```

### Step 3: Camera setup
```
Filming today? ● Yes ○ No
Camera 1: DTL [confirmed]
Camera 2: Face-on [confirmed]

Sync reminder:
  ✓ Open GoPro Quik → sync both cameras to phone time
  ✓ Start recording before teeing off
[I've synced my cameras] (optional checkbox, logged)
```

### Step 4: Hole conditions
Component from Issue 021 — collapsible, skippable.

### Step 5: Review + Create
Summary card with all selections. [Create round →] button.

---

## API spec

### POST /api/sessions
```typescript
{
  type: 'round', courseId: string, teeId: string, sessionDate: string,
  weatherConditions?: string, temperatureF?: number, windDescription?: string,
  camerasConfigured?: boolean,
  holeOverrides?: Array<{ holeNumber: number, type: string, note?: string }>
}
// 201
{ session: { id, type, courseId, sessionDate } }
```
