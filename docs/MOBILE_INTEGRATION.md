Mobile integration notes

This document captures actions to coordinate between the React web app and the existing Flutter mobile_app.

Key points:
- APIs: Ensure stable API contracts (pagination, filtering, auth tokens). Use shared OpenAPI spec if possible.
- Design tokens: src/lib/designTokens.js created for basic tokens. Prefer Tailwind as source-of-truth for web; sync tokens with Flutter team.
- Authentication: Ensure mobile and web use same auth endpoints and token formats.
- Assets: Share icons and web manifest where possible.
- Testing: Run API contract tests and coordinate feature parity for core screens (Dashboard, Reports, Jobs, Inventory).
