# [Feature Name] - Phase NN: [Phase Title]

> Feature pack: `.cursor/feature-prompts/<feature-slug>/`  
> Previous phases done: [list or "none"]  
> Do not implement later phases in this thread.

---

## Context (minimal recap)

- **Problem:**
- **Invariants (must not change):**
- **Repo / reference paths:**
- **Assumptions:**

---

## Objective (this thread ONLY)

[Single clear outcome]

---

## Out of scope

- [ ]
- [ ]

---

## Files / modules

| Path | Role |
|------|------|
| | |

---

## Acceptance criteria

- [ ]
- [ ]
- [ ]

---

## Tests / validation before next phase

1. First pass: `npm run build`, manual smoke per acceptance criteria above.
2. **Second validation round** (mandatory before phase gate): re-check vs this phase and `00-context.md`; architecture audit; diff stats; re-run build. If a process gap appeared, **rules evolution** (update `.cursor/rules/`). See `frontend-engineering-partner.mdc`.

---

## Expected deliverable

[Review report / gap matrix / bounded diff / test results - specify]

---

## Notes for worker

- Read only what this phase needs.
- Flag Defibox memo / exact-mint mismatch risks explicitly; do not invent contract behavior.
- All token math must stay **BigInt**-only.
- Reply using the phase-thread format in `feature-thread-workflow.mdc`.
