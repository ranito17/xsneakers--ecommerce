# Code Review Workflow

You are reviewing code in a production fullstack e-commerce app (React + Node.js + MySQL).

## Review Checklist

### Safety
- [ ] Does this change break any existing API contract?
- [ ] Does this modify business logic that wasn't supposed to change?
- [ ] Does this touch the database schema without explicit request?
- [ ] Does this affect PayPal integration? (must stay in SANDBOX)
- [ ] Does this introduce a new dependency? Is it justified?

### Correctness
- [ ] Does the change solve the actual problem?
- [ ] Are edge cases handled? (empty states, null values, network errors)
- [ ] Are there any obvious bugs in the new code?

### Code Quality
- [ ] Is there any dead code introduced?
- [ ] Are there unused imports or variables?
- [ ] Are there console.logs that should be removed before production?

### React-specific
- [ ] Are there missing keys in lists?
- [ ] Are useEffect dependencies correct?
- [ ] Are there unnecessary re-renders?

### Node.js-specific
- [ ] Are errors handled and returned with correct status codes?
- [ ] Are SQL queries protected against injection?
- [ ] Are there missing await keywords?

## Output Format
Rate each section: ✅ Good / ⚠️ Concern / 🚨 Problem
List actionable items only. No vague suggestions.
