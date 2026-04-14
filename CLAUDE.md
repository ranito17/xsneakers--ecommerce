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

## Session Change Log

### Auth — Cross-Origin Production Fix
- **Root cause**: Browsers block third-party cookies for cross-domain requests (Vercel → Railway)
- `backend/src/app.js`: Added `app.set('trust proxy', 1)` for Railway proxy
- `backend/src/middleware/auth.js`: Reads token from `Authorization: Bearer` header first, cookie as fallback
- `backend/src/controllers/userController.js`: Login response now includes `token` in body
- `frontend/src/services/api.js`: Request interceptor attaches `Authorization: Bearer <token>` from localStorage
- `frontend/src/context/AuthProvider.jsx`: Stores token to localStorage on login, removes on logout

### Auth Redirect on Refresh — Bug Fix
- **Root cause**: `isAuthenticated` starts `false`, async `checkAuth()` completes after initial render, causing premature redirect
- `frontend/src/pages/ProfilePage.jsx`: Added `authLoading` from `useAuth()`, useEffect guards with `if (authLoading) return` before checking `isAuthenticated`
- `frontend/src/pages/OrderPage.jsx`: Same fix + corrected `navagate` typo → `navigate`

### Analytics 500 — Bug Fix
- **Root cause 1**: MySQL 8.0 `ONLY_FULL_GROUP_BY` — SELECT used `DATE_FORMAT(created_at, ?)` but GROUP BY used `DATE()`, `YEARWEEK()`, etc.
- `backend/src/models/Analytics.js` `getRevenueAnalytics`: GROUP BY now uses identical `DATE_FORMAT(created_at, ?)` expression; dateFormat param passed twice
- **Root cause 2**: All catch blocks in Analytics.js swallowed original MySQL errors by throwing `new Error('Failed to...')` — real error was lost
- Fixed all catch blocks to `console.error(fn, err); throw err;` to surface actual DB errors

### Activity Log 500 — Bug Fix
- **Root cause**: `Activity.js` `getAll()` used `connection.execute()` (binary prepared statements) for a dynamically built query with `LIMIT ? OFFSET ?`. MySQL2 binary protocol has known compatibility issues with dynamic queries in MySQL 8.x production.
- `backend/src/models/Activity.js` `getAll()`: Changed `connection.execute(query, params)` → `connection.query(query, params)`

### Mobile UI Fixes
- Hero: shorter on mobile, text breathing room, hero image hidden
- Category dropdown: 100% width on mobile
- Product grid: 1 column on mobile (both 768px and 480px)
- Empty cart: override desktop `min-width: 1150px` to `width: 100%` on mobile
- Contact form: 100% width on mobile
- Removed IN STOCK / OUT OF STOCK badge from all product cards
- About Us: removed fake statistics (500+/1000+/5+ numbers)
- About Us: replaced "Our Team" with founder section (Ranit, Israel, sole owner)
- Removed all international shipping mentions across Contact, About Us pages
- Dashboard card headers: stack vertically on mobile (768px breakpoint in `dashboard.module.css`)
