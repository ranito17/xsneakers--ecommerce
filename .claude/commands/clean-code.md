# Code Cleanup Workflow

You are cleaning a file in a production fullstack e-commerce app (React + Node.js + MySQL).

## What you are allowed to remove
- Unused imports (confirmed unused via search)
- Unused variables (never read after declaration)
- Dead code (unreachable blocks, commented-out code that serves no documentation purpose)
- Console.log statements that are debug-only (not error logging)

## What you must NEVER touch
- Working business logic
- Any code you are not 100% certain is unused
- Existing API routes or handlers
- Database queries or models
- PayPal integration code

## Steps (follow in order)

1. **Scan** — Read the file. List every candidate for removal.
2. **Verify** — For each candidate, confirm it is not used elsewhere in the codebase (use grep/search if needed).
3. **Report** — Show the user: "I will remove: [list]. I am leaving: [list] because I am not 100% sure."
4. **Wait for confirmation** if anything is uncertain.
5. **Clean** — Apply only confirmed removals.
6. **Show** — Output the FULL cleaned file. List removed items at the top.

## Rule: When in doubt, ASK. Never delete, then explain.
