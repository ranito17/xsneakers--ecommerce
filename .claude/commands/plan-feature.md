# Feature Planning Workflow

You are planning a new feature for a production fullstack e-commerce app (React + Node.js + MySQL).

## Phase 1 — Explore (do NOT write any code)
- Read relevant existing files
- Identify which components, routes, and DB tables are involved
- List any existing utilities or patterns that should be reused
- Identify potential conflicts with existing logic

## Phase 2 — Plan (ultrathink)
Think hard. Produce a plan with:

1. **Summary** — What this feature does (2–3 sentences)
2. **Files affected** — List every file that will need to change
3. **New files** — List any new files to be created
4. **DB changes** — List any schema changes (NONE unless explicitly requested)
5. **API changes** — New routes or modifications to existing ones
6. **Risk areas** — Parts of the plan that could break existing functionality
7. **Implementation phases** — Break into small, safe steps with [ ] checkboxes

## Phase 3 — Confirm
Present the plan. Wait for user approval before writing a single line of code.

## Phase 4 — Implement
- Work through the checklist one step at a time
- After each step: run relevant tests if available
- Mark completed items with [x]

## Phase 5 — Review
After implementation, run /review on changed files.

## Constraints
- Prefer reusing existing patterns over introducing new ones
- Prefer small PRs — implement in chunks, not all at once
- PayPal stays in SANDBOX mode
- Do not modify DB schema unless the user explicitly approves it in Phase 3
