# File Structure

## Architecture Principles

### Page Structure Pattern
All `page.tsx` files should follow this clean pattern:
- **Single import rule**: Import only ONE main section component
- **_sections folder**: Each page has its own `_sections/` folder for UI components
- **Barrel exports**: Use `index.ts` for clean imports from `_sections`
- **Separation of concerns**: Layout, business logic, and UI components are separated

### Example Page Structure:
```typescript
// ✅ Good: Clean page.tsx
"use client"
import { DashboardSection } from './_sections'

export default function DashboardPage() {
  return <DashboardSection />
}

// ❌ Bad: Bloated page.tsx with multiple imports and logic
```

## Current File Structure

```
bi-weekly-digest/
├── src/
│   ├── app/
│   │   ├── (admin)/                 # Admin route group
│   │   │   ├── layout.tsx          # Admin layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   ├── _sections/      # Dashboard UI components
│   │   │   │   │   ├── chat-messages.tsx
│   │   │   │   │   ├── input-area.tsx
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── index.ts    # Barrel exports
│   │   │   │   └── page.tsx        # Imports only from _sections
│   │   │   └── ...other-admin-pages/ # Future admin pages
│   │   ├── api/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── logout/
│   │   │   ├── config/
│   │   │   ├── blogs/
│   │   │   └── newsletter/
│   │   │       ├── send/
│   │   │       └── cron/
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── blogs/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ai-prompt-box.tsx
│   │   └── layout/                 # Layout-specific components
│   │       ├── admin-sidebar.tsx
│   │       ├── admin-header.tsx
│   │       └── index.ts            # Barrel exports
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   └── resend.ts
│   │
│   └── middleware.ts               # Auth protection
│
├── docs/                           # Project documentation
│   ├── file-structure.md
│   ├── tech-stack.md
│   └── integration-flow.md
│
├── .env.local
├── .env.example
├── package.json
└── README.md
```

## File Naming Conventions

### Components
- **Page sections**: `{purpose}-section.tsx` (e.g., `dashboard-section.tsx`, `newsletter-section.tsx`)
- **UI components**: kebab-case (e.g., `admin-header.tsx`, `chat-messages.tsx`)
- **Layout components**: `{area}-{type}.tsx` (e.g., `admin-sidebar.tsx`)

### Folders
- **Page sections**: `_sections/` (private to each page)
- **Shared components**: `components/ui/` or `components/layout/`
- **Route groups**: `(admin)/`, `(auth)/` etc.

## Best Practices

1. **Keep page.tsx minimal** - Only state management and single section import
2. **Use _sections for page-specific UI** - All UI logic goes in dedicated components
3. **Leverage barrel exports** - Clean imports via `index.ts`
4. **Separate concerns** - Layout (route-level), Logic (page-level), UI (sections)
5. **Follow naming conventions** - Consistent file and component naming
6. **One responsibility per file** - Each component has a single, clear purpose

## Migration Guide

When creating new pages:
1. Create `page.tsx` with minimal structure
2. Add `_sections/` folder
3. Extract all UI into section components
4. Create `index.ts` for barrel exports
5. Keep page.tsx importing only from `_sections`
