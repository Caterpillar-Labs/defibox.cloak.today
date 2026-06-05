# [Audit Scope] - Phase NN: [Phase Title]

> Audit pack: `.cursor/feature-prompts/<audit-slug>/` (`packType: audit`)
> Previous phases done: [list or "none"]
> **Read-only:** no application code changes in this thread.

---

## Context (minimal recap)

- **Audit goal:**
- **Scope (this phase only):**
- **Invariants (must not change):**
- **Baseline LOC (if known):**
- **Assumptions:**

---

## Objective (this thread ONLY)

Produce a **phase audit report** for the scoped paths: LOC table, findings matrix, optimization candidates. Do not implement refactors.

---

## Out of scope

- Application code diffs, commit, push
- Domains assigned to other phases
- Router swaps, LP ops, multi-wallet support (unless explicitly in audit scope)

---

## Files / modules to inspect

| Path | Role |
|------|------|
| | |

---

## Acceptance criteria

- [ ] LOC table: all files **>300** and **>500** lines in scope
- [ ] Findings matrix: each row has ID, severity, path, symptom, recommendation
- [ ] Optimization candidates: merge / extract / delete with risk and LOC delta estimate
- [ ] Report saved to `reports/phase-NN-report.md` in the audit pack (or pasted in chat if pack not writable)
- [ ] No application diff produced

---

## Validation (read-only only)

1. `wc -l` on scoped paths; sort by size
2. Duplication scan: quote math, balance parsing, zaction builders
3. BigInt audit: grep for `number` / `parseFloat` / `toFixed` on token amounts in scope
4. Unused export / orphan component scan for scope

Do **not** run lint --fix on app code in audit phases.

---

## Expected deliverable

Markdown report containing:

1. **LOC table**
2. **Findings** (IDs like `LIB-01`, `APP-01`, …)
3. **Optimization candidates**
4. **Out of scope for next phase** (explicit)

---

## Notes for worker

- Apply **Audit checklist** in `frontend-engineering-partner.mdc`.
- Do not recommend router/LP/multi-wallet expansion unless the audit scope explicitly includes it.
- Reply using **Audit phase thread** format in `feature-thread-workflow.mdc`.
