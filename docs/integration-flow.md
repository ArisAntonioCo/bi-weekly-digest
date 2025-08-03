# Integration Flow

## System Flow
```
Admin → Supabase Auth → Dashboard → Supabase DB
                          ↓
                    Configuration & Content
                          ↓
             Vercel Cron (Biweekly)
                          ↓
                    API Route
                    ↙    ↓    ↘
           Supabase  OpenAI  Resend
              ↓         ↓       ↓
           Content  Analysis  Email
```

## Steps

### 1. Admin Login
- Admin signs in via Supabase Auth
- Access protected dashboard

### 2. Content Management
- Edit system prompt configuration
- Create/update blog content manually or with AI help
- All saved to Supabase

### 3. Public Blog Page
- Fetches latest content from Supabase
- Displays blog posts (public or protected)

### 4. Biweekly Newsletter
- Vercel Cron triggers every 2 weeks
- Fetches config and content from Supabase
- Uses OpenAI to generate analysis
- Sends HTML email via Resend API

### 5. Admin Oversight
- Monitor newsletter sends
- Update content anytime
- Manual trigger option available