# DocGen Enterprise

Enterprise-grade document generation software with a polished UI, API-driven architecture, and validation-first workflows.

## What is included

- **Modern UI (Next.js + Tailwind CSS)**
  - Dashboard with operational metrics and recent outputs
  - Template management workspace (create/search/rename/delete)
  - Generation workspace with dynamic variable forms and preview/copy output

- **Feature-rich document generation engine**
  - Variable placeholders using `{{variable_name}}`
  - Automatic variable extraction
  - Strict input validation with Zod
  - Clear API error handling and typed responses

- **Quality foundation**
  - TypeScript strict mode
  - ESLint + Next.js best practices
  - Unit tests for template rendering logic (Vitest)
  - Clean, modular folder structure for scale

## Tech stack

- **Frontend + API**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Persistence**: JSON file-backed store at `data/store.json`
- **Tests**: Vitest

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint checks
npm run typecheck  # TypeScript checks
npm run test       # Unit tests
```

## API overview

- `GET /api/templates` - list templates
- `POST /api/templates` - create template
- `GET /api/templates/:id` - get template details
- `PATCH /api/templates/:id` - update template
- `DELETE /api/templates/:id` - delete template
- `GET /api/documents` - list recent documents
- `POST /api/documents` - generate document
- `GET /api/metrics` - fetch dashboard metrics and latest documents

## Next enterprise upgrades (recommended)

- Add RBAC authentication (SSO / OAuth2 / SAML)
- Move persistence to Postgres with migrations and audit trails
- Add background job queue for large document batch generation
- Add PDF/DOCX exporters and template versioning
- Add observability (structured logs, tracing, metrics)
- Add CI/CD pipeline gates for lint, tests, security scans
