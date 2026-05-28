# Issue 053 — Arccos Integration Scaffold

**Phase:** 11 — Polish  
**Depends on:** All previous phases  
**Branch:** `feature/issue-053-arccos-scaffold`

---

## Objective

Prepare the application for future Arccos API integration without implementing it. When Arccos API access is granted, implementing the integration should require filling in service functions, not refactoring the app.

---

## Acceptance Criteria

- [ ] Settings page "Arccos" section shows "Coming soon — API access pending" with explanation
- [ ] `src/server/services/arccosService.ts` exists with function signatures returning `NotImplementedError`
- [ ] `ARCCOS_ENABLED` feature flag in env — `false` by default — gates all Arccos code paths
- [ ] All schema hooks already in place (`arccos_round_id`, `arccos_shot_id`, `sg_source`)
- [ ] Admin console shows Arccos integration status: "Pending API Access"
- [ ] Code comments throughout mark Arccos integration points

---

## arccosService.ts scaffold

```typescript
// src/server/services/arccosService.ts
// ARCCOS_INTEGRATION: Implement these functions when API access is granted
// API docs: https://www.postman.com/arccosgolf/arccos-public-api/

export async function getRounds(userId: string): Promise<ArccosRound[]> {
  throw new Error('Arccos API integration not yet enabled. Set ARCCOS_ENABLED=true and implement.')
}

export async function getRoundShots(roundId: string): Promise<ArccosShot[]> {
  throw new Error('Arccos API integration not yet enabled.')
}

export async function syncRoundToSession(arccosRoundId: string, sessionId: string): Promise<void> {
  throw new Error('Arccos API integration not yet enabled.')
}
```

---

## Feature flag usage pattern

```typescript
// In any route that will use Arccos:
if (!env.ARCCOS_ENABLED) {
  return res.status(503).json({ 
    error: 'Arccos integration not yet available', 
    code: 'ARCCOS_NOT_ENABLED' 
  })
}
```

---

## Code comment convention

Add this comment at every Arccos integration point:
```typescript
// ARCCOS_INTEGRATION: Replace manual SG with Arccos API data when available
// See: src/server/services/arccosService.ts
```
