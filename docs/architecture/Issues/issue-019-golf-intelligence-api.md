# Issue 019 — Golf Intelligence API Client + Course Search

**Phase:** 4 — Course Library  
**Depends on:** Issue 016  
**Branch:** `feature/issue-019-golf-intelligence-api`

---

## Objective

Build the Golf Intelligence API client and course search endpoint. Course data is fetched once and cached permanently — the API is never called twice for the same course.

---

## Acceptance Criteria

- [ ] `src/server/services/golfIntelligenceService.ts` exports typed client functions
- [ ] `GET /api/courses/search?q=[name]&state=[state]` returns matching courses
- [ ] `GET /api/courses/gi/[giId]/scorecard` fetches and caches full scorecard
- [ ] Cached courses served from DB — Golf Intelligence never called twice for same course
- [ ] If Golf Intelligence API unavailable: graceful error, does not crash
- [ ] API key is server-side only — never returned to client or logged
- [ ] `trackEvent('course.api_lookup')` on every API call
- [ ] TypeScript types defined for all Golf Intelligence response shapes

---

## Service interface — src/server/services/golfIntelligenceService.ts

```typescript
export async function searchCourses(query: string, state?: string): Promise<GICourseSearchResult[]>
export async function getCourseScorecard(giCourseId: string): Promise<GIScorecard>

interface GICourseSearchResult {
  id: string, name: string, city: string, state: string, country: string, totalHoles: number
}

interface GIScorecard {
  courseId: string, courseName: string
  tees: Array<{
    name: string, color: string, totalYards: number, courseRating: number, slopeRating: number
    holes: Array<{ number: number, par: number, yards: number, handicapIndex: number }>
  }>
}
```

---

## Caching logic

```typescript
// Check DB first
const cached = await db.query.courses.findFirst({ where: eq(courses.golfIntelligenceId, giId) })
if (cached) return formatFromDB(cached)
// Not cached — call API, store, return
```

---

## API specs

### GET /api/courses/search
```typescript
// ?q=Meadow+Springs&state=WA
{ courses: Array<{ giId, name, city, state, country, totalHoles, cachedLocally: boolean }> }
// 400: query < 3 chars
// 503: Golf Intelligence unavailable
```

### GET /api/courses/gi/[giId]/scorecard
```typescript
{ course: { id, giId, name, city, state, tees: [...] }, source: 'cache' | 'api' }
```

---

## Notes for Claude Code

- Build client against actual Golf Intelligence API response shape — adjust types to match
- Log every API call — credit-based billing means we never want unexpected calls
- Rate limit our search endpoint: max 10 searches per user per minute
- Search results already in our DB should show `cachedLocally: true`
