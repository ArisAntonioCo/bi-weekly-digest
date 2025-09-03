# Glowbar Frontend File Structure (context7-mcp canonical)

A clean, scalable structure for a Next.js (App Router) project with server-first data access and per-page UI slices. This is the single source of truth for where files go.

## Goals
- Predictable: same place for actions, services, and UI state.
- Server-first: server components by default; client only where needed.
- Feature-focused: each page/feature owns its UI code and slice.
- Minimal layers: no atoms/molecules. Keep names human and obvious.

## Top-Level Workspace
- `package.json`: scripts, dependencies
- `tsconfig.json`: `paths` with `@/*` → `src/*`
- `.env*`: runtime configuration (no secrets in client)
- `src/`: application code (see below)
- `public/`: static assets
- `docs/`: documentation

## Source Tree (Canonical)

```text
src
├─ app/                              # Next.js App Router (server-first)
│  ├─ _providers/                    # Global client providers (Redux, theme)
│  │  └─ store-provider.tsx          # context7-mcp: Redux Provider
│  ├─ (public)/                      # Public routes (no auth)
│  │  └─ page-name/                  # A public feature/page
│  │     ├─ page.tsx                 # Server component (imports ONE composer)
│  │     ├─ layout.tsx               # Optional server layout
│  │     ├─ _components/             # Feature-local components
│  │     ├─ _sections/               # Composed sections of the page
│  │     ├─ _providers/              # Page-specific client providers (URL↔slice)
│  │     ├─ _redux/                  # Feature slice (UI state only)
│  │     └─ pages/                   # Page composers (one per route)
│  ├─ (protected)/                   # Authenticated routes
│  │  └─ feature/                    # e.g., admin, dashboard, bookings
│  │     ├─ page.tsx
│  │     ├─ layout.tsx
│  │     ├─ _components/
│  │     ├─ _sections/
│  │     ├─ _providers/
│  │     └─ _redux/
│  ├─ api/                           # Route handlers (if used)
│  ├─ layout.tsx                     # Root layout (server)
│  └─ globals.css                    # Global styles (Tailwind v4 + tokens)
│
├─ components/                       # Global custom components (shared)
│  └─ ui/                            # Shadcn/Radix-based primitives
│
├─ hooks/                            # Shared React hooks (no domain logic)
├─ lib/                              # Client-side helpers (utils, formatters)
├─ models/                           # UI models (e.g., TextField)
├─ schemas/                          # Zod schemas & DTOs
├─ server/                           # Server-only code (no React here)
│  ├─ actions/                       # Server Actions (per domain) *.actions.ts
│  ├─ services/                      # Service layer (HTTP to backend) *-service.ts
│  └─ fetch/                         # Fetch wrappers (base URL, headers, tags)
│
├─ redux/                            # Global Redux setup (single store)
│  ├─ store.ts                       # context7-mcp: configureStore()
│  └─ hooks.ts                       # context7-mcp: typed hooks
│
├─ types/                            # Shared TypeScript types/interfaces
└─ utils/                            # Generic utilities (non-React, cross-cutting)
```

## Feature Folder Details
- `_components/`: small leaf components scoped to the feature. Prefer server components; mark `'use client'` only when interactivity is needed.
- `_sections/`: composed UI blocks that arrange multiple components.
- `_providers/`: client providers that sync URL ↔ Redux UI state and call Server Actions.
- `_redux/`: one slice per feature page (UI state only: filters, pagination, transient flags). No async thunks or side effects.
- `pages/`: composer components that assemble the full screen from local pieces.
- `page.tsx`: must import and render exactly ONE composer from `pages/` (no other imports).
- `layout.tsx`: optional server layout.

## Server Actions & Services
- `server/actions/*.actions.ts`: thin, domain-scoped entry points.
  - Validate inputs (Zod), call the service, map/shape to UI, revalidate tags.
- `server/services/*-service.ts`: backend IO only (fetch to Go API, etc.).
  - Use central fetch wrappers under `server/fetch/*` for base URL, headers, and caching.
  - No React, browser APIs, or window/localStorage.

## Redux Pattern (UI-only)
- Global store lives in `src/redux/store.ts`; typed hooks in `src/redux/hooks.ts`.
- Feature slices live next to the page under `app/**/_redux/*.slice.ts`.
- Register feature reducers in `store.ts` (static) or via a lightweight injector if you want lazy routes (optional).

Example feature slice path:
```text
src/app/(protected)/admin/_redux/admin.slice.ts
```

Access from components:
```ts
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
const value = useAppSelector(s => s.admin.filters);
```

## Routing Conventions
- Use route groups `(public)`, `(protected)` to separate access patterns.
- Dynamic segments: `[id]`, catch-all: `[...slug]`, optional: `[[...slug]]`.
- Co-locate feature UI logic with the route; keep actions/services centralized.
- Add `app/api/*` handlers only when you need an edge/bff layer; otherwise call `server/actions` directly from server components or providers.

## Naming Rules
- Files/folders: kebab-case (`users-table.tsx`, `admin-service.ts`).
- React components: PascalCase (`UsersTable.tsx` only if colocated with many components; favor kebab-case files exporting PascalCase components).
- Actions: `*.actions.ts` (e.g., `admin.actions.ts`).
- Services: `*-service.ts` (e.g., `admin-service.ts`).
- Types: colocate specific types near features; shared go to `src/types`.

## Imports & Aliases
- Use `@/*` alias (configured in `tsconfig.json`) for absolute imports:
  - `@/server/actions/admin.actions`
  - `@/app/(protected)/admin/_redux/admin.slice`
  - `@/components/ui/button`

## Client vs Server Components
- Default to server components for pages/layouts and read-heavy sections.
- Use client components only for interactivity (`useState`, `useEffect`, event handlers, browser APIs).
- Don’t pass functions from server to client across the boundary; pass data/props only.

## Caching & Revalidation (Tags)
- Lists: `fetch(..., { next: { tags: ['admin-list'] } })`
- Mutations: call `revalidateTag('admin-list')` inside the relevant Server Action.
- Use `cache: 'no-store'` for data that must never cache; prefer tag-based invalidation for UX freshness after writes.

## Example Feature Layout (Admin)
```text
src/app/(protected)/admin/
├─ page.tsx                       # Server: renders sections, fetches initial data
├─ _components/
│  ├─ users-table.tsx             # Client: table w/ sorting, selection
│  └─ filter-bar.tsx              # Client: controls bound to Redux UI state
├─ _sections/
│  └─ users-section.tsx           # Server: composes server data + client leaves
├─ _providers/
│  └─ admin-provider.tsx          # Client: URL↔slice sync, calls actions
└─ _redux/
   └─ admin.slice.ts              # UI-only slice (filters, pagination, flags)
```

## Minimal Boilerplate to Add a Feature
1) Create route folder under `(public)` or `(protected)`.
2) Add `page.tsx` (server) and optional `layout.tsx`.
3) Add `_redux/<feature>.slice.ts` for UI state.
4) Add `_sections/` and `_components/` as needed.
5) If interactivity is tied to URL/search params, add `_providers/<feature>-provider.tsx` to sync URL ↔ slice and invoke Server Actions.

This structure keeps responsibilities clear, scales with features, and matches context7-mcp canonical paths used by the project setup.
