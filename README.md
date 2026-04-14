# Claude Code Setup — E-Commerce Project

This folder contains everything Claude Code needs to work safely and efficiently on this project.

## How to use this

### 1. Place files in your project root

```
your-project/
├── CLAUDE.md                        ← project memory (auto-loaded every session)
├── .claude/
│   └── commands/
│       ├── fix-bug.md               ← /fix-bug
│       ├── fix-ui.md                ← /fix-ui
│       ├── clean-code.md            ← /clean-code
│       ├── review.md                ← /review
│       └── plan-feature.md          ← /plan-feature
└── docs/
    ├── architecture.md              ← @docs/architecture.md (load on demand)
    ├── api-routes.md                ← @docs/api-routes.md (load on demand)
    ├── db-schema.md                 ← @docs/db-schema.md (load on demand)
    └── plan.md                      ← @docs/plan.md (active task checklist)
```

---

## Slash Commands

| Command | Use it when... |
|---------|---------------|
| `/fix-bug` | You have a bug and want Claude to fix only the root cause |
| `/fix-ui` | You want a UI/design change without touching logic |
| `/clean-code` | You want safe removal of unused imports/vars/dead code |
| `/review` | You want Claude to review code before or after changes |
| `/plan-feature` | You want to plan a new feature before any code is written |

---

## Reference Docs

Load these with `@` only when relevant — they cost tokens if loaded every session.

| File | Load when... |
|------|-------------|
| `@docs/architecture.md` | Working on data flow, system design, or a new feature |
| `@docs/api-routes.md` | Adding/modifying backend routes or frontend API calls |
| `@docs/db-schema.md` | Working on anything DB-related |
| `@docs/plan.md` | Resuming a multi-session task |

---

## Context Tips

- Start each new task with `/clear` to avoid stale context from the previous session
- Use `/btw` for quick questions that don't need to stay in history
- Use `/compact` when the session gets long — `CLAUDE.md` ensures critical info survives
- Say "use subagents to explore X" when you need Claude to search the codebase without filling your context

---

## Fill in the blanks

After placing these files, ask Claude to help you fill in the real data:

1. Run `SHOW TABLES;` and `DESCRIBE tablename;` and paste into `docs/db-schema.md`
2. List your actual API routes in `docs/api-routes.md`
3. Fill in your real folder structure in `docs/architecture.md`
4. Run `/init` in Claude Code to let it verify and update `CLAUDE.md` for your project
