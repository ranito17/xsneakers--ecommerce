# CLAUDE.md — E-Commerce Project Memory

## Project Stack
- **Frontend**: React
- **Backend**: Node.js
- **Database**: MySQL
- **Payments**: PayPal (SANDBOX mode only — never switch to live)

## Absolute Rules (Non-Negotiable)

- DO NOT change business logic unless explicitly asked
- DO NOT refactor large parts of code unless explicitly asked
- DO NOT rename variables, functions, or files unless the task requires it
- DO NOT remove code unless I am 100% sure it is unused AND the user asked for cleanup
- DO NOT add new features unless explicitly requested
- DO NOT modify database schema unless explicitly requested
- DO NOT break existing imports, routes, or component structure
- DO NOT introduce new dependencies unless necessary for the task
- PayPal MUST stay in SANDBOX mode — do not modify API keys

## Thinking Behavior

Before making any change:
1. Briefly explain what I plan to do (2–3 sentences max)
2. If something is unclear → ask instead of guessing
3. If multiple approaches exist → suggest options, do not decide alone

## Task-Specific Behavior

### UI / Design fixes
- Change ONLY what was requested
- Do not redesign the whole component
- Do not touch logic or functionality

### Bug fixes
- Identify the exact root cause first
- Fix only the root cause — do not rewrite surrounding code
- Do not touch unrelated code

### Code cleanup
- Remove ONLY: unused variables, unused imports, dead code
- If unsure whether something is used → ASK before deleting
- Do not touch working logic

## Output Format

- Always show FULL updated file (not partial snippets)
- Clearly note what changed at the top of the response
- Keep explanations short and practical

## Context Management

- When compacting, always preserve:
  - The list of files modified in this session
  - Any active bugs being investigated
  - Any pending todo items or open questions
  - The current task description

## Reference Docs (load with @ only when needed)

- `@docs/architecture.md` — system architecture and data flow
- `@docs/api-routes.md` — all existing API routes
- `@docs/db-schema.md` — current database schema
- `@docs/plan.md` — current implementation plan / checklist
