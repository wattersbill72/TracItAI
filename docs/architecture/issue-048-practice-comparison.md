# Issue 048 — Practice vs On-Course Comparison

**Phase:** 10 — Range + Short Game  
**Depends on:** Issue 043, 047  
**Branch:** `feature/issue-048-practice-comparison`

---

## Objective

Add a comparison view: select a club → compare attributes and mechanics between range sessions and on-course shots.

---

## Acceptance Criteria

- [ ] Comparison accessible from trends dashboard and range session view
- [ ] Club selector: any club with both range and on-course data
- [ ] Side-by-side: pull rate, early release rate, avg distance, top tag — range vs course
- [ ] Large gap (>15%) auto-generates "Pressure/routine gap detected" pattern insight (Issue 044)
- [ ] Minimum 5 shots from each context required to show comparison

---

## Comparison layout

```
6-Iron: Range vs On-Course

                  Range    On-course
Pull rate         12%      31%       ⚠ Large gap
Early release     15%      28%       ⚠ Large gap
Avg distance      174 yds  168 yds
Top tag           great_tempo  early_release

⚠ Your 6-iron mechanics break down on the course.
  This typically indicates a pressure or routine issue.
  Consider working on your pre-shot routine.
```
