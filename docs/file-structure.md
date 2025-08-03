# File Structure

```
bi-weekly-digest/
├── app/                       # Next.js 15 App Router
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── logout/
│   │   ├── config/
│   │   ├── blogs/
│   │   └── newsletter/
│   │       ├── send/
│   │       └── cron/
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── blogs/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ConfigEditor.tsx
│   ├── BlogEditor.tsx
│   └── BlogList.tsx
│
├── lib/
│   ├── supabase.ts
│   ├── openai.ts
│   └── resend.ts
│
├── middleware.ts              # Auth protection
├── .env.local
├── .env.example
├── package.json
└── README.md
```
