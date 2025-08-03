# File Structure

## Architecture Principles

### Page Structure Pattern
All `page.tsx` files should follow this clean pattern:
- **Single import rule**: Import only ONE main page component
- **_page folder**: Each page has its own `_page/` folder for the main page component
- **_sections folder**: UI components are organized in `_sections/` folder
- **Barrel exports**: Use `index.ts` for clean imports from both folders
- **Separation of concerns**: Layout, business logic, and UI components are separated

### Example Page Structure:
```typescript
// ✅ Good: Clean page.tsx
"use client"
import { DashboardPage } from './_page'

export default function AdminDashboard() {
  return <DashboardPage />
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
│   │   │   │   ├── _page/          # Main page component
│   │   │   │   │   ├── dashboard-page.tsx
│   │   │   │   │   └── index.ts    # Barrel exports
│   │   │   │   ├── _sections/      # UI components
│   │   │   │   │   ├── chat-messages.tsx
│   │   │   │   │   ├── input-area.tsx
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── index.ts    # Barrel exports
│   │   │   │   └── page.tsx        # Imports only from _page
│   │   │   ├── posts/              # Future posts pages
│   │   │   │   └── create/
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
- **Page components**: `{purpose}-page.tsx` (e.g., `dashboard-page.tsx`, `newsletter-page.tsx`)
- **Section components**: `{purpose}-{type}.tsx` (e.g., `chat-messages.tsx`, `input-area.tsx`)
- **UI components**: kebab-case (e.g., `admin-header.tsx`, `button.tsx`)
- **Layout components**: `{area}-{type}.tsx` (e.g., `admin-sidebar.tsx`)

### Folders
- **Page components**: `_page/` (main page component for each page)
- **Page sections**: `_sections/` (UI components for each page)
- **Shared components**: `components/ui/` or `components/layout/`
- **Route groups**: `(admin)/`, `(auth)/` etc.

## Best Practices

1. **Keep page.tsx minimal** - Only imports one page component from `_page`
2. **Use _page for main logic** - Business logic and state management
3. **Use _sections for UI** - Reusable UI components and presentation logic
4. **Leverage barrel exports** - Clean imports via `index.ts` in both folders
5. **Separate concerns** - Layout (route-level), Logic (_page), UI (_sections)
6. **Follow naming conventions** - Consistent file and component naming
7. **One responsibility per file** - Each component has a single, clear purpose

## Migration Guide

When creating new pages:
1. Create `page.tsx` with minimal structure
2. Add `_page/` folder for main page component
3. Add `_sections/` folder for UI components
4. Create `index.ts` for barrel exports in both folders
5. Keep page.tsx importing only from `_page`
6. Keep _page component importing from `_sections` as needed
