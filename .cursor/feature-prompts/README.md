# Feature and audit prompt packs (local only)

This directory is **gitignored**. Do not commit or push packs.

## Pack types

| Prefix / `packType` | Purpose | Phases deliver |
|---------------------|---------|----------------|
| `feature-*` / `feature` | Build or refactor | Code, tests, second validation round |
| `audit-*` / `audit` | Quality / LOC / optimization review | Read-only reports, P0/P1/P2 backlog |

## Layout (both types)

```
.cursor/feature-prompts/<slug>/
  README.md
  00-context.md
  phase-NN-<slug>.md
  99-definition-of-done.md
  reports/                 # audit packs: phase deliverables
    phase-NN-report.md
```

## Active packs (local)

| Slug | Goal |
|------|------|
| _(none)_ | Thread 0 creates packs on demand |

## Lifecycle

1. **Thread 0** creates or refreshes the pack (no app code for features/audits unless user says implement now).
2. **One Cursor worker thread per phase** - paste `phase-NN-*.md`.
3. **Gate:** user validates (`phase validée`, `go phase N`) before the next phase.
4. **Cleanup:** delete the pack folder when integrated or audit backlog accepted.

## Rules

- Features: `.cursor/rules/feature-thread-workflow.mdc`, template `feature-phase-prompt.template.md`
- Audits: **Audit workflow** in same rule file, template `audit-phase-prompt.template.md`, checklist in `frontend-engineering-partner.mdc`
- Project context: `.cursor/knowledge/project.md`
