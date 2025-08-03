# Project To-Do List

## Setup
- [ ] Initialize Next.js 15 with TypeScript and App Router
- [ ] Install dependencies: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `resend`, `openai`
- [ ] Create `.env.local` file with required variables
- [ ] Set up project structure

## Supabase Setup
- [ ] Create Supabase project
- [ ] Create database tables:
  - [ ] `configurations` (id, system_prompt, updated_at)
  - [ ] `blogs` (id, title, content, created_at)
  - [ ] `recipients` (id, email, subscribed)
- [ ] Enable Supabase Auth with email/password
- [ ] Set up Row Level Security (admin only)

## API Routes
- [ ] `/api/auth/login` - Admin login
- [ ] `/api/auth/logout` - Admin logout
- [ ] `/api/config` - CRUD for system prompt
- [ ] `/api/blogs` - CRUD for blog content
- [ ] `/api/newsletter/send` - Manual trigger
- [ ] `/api/newsletter/cron` - Biweekly cron

## Pages
- [ ] `/auth/login` - Admin login page
- [ ] `/admin/dashboard` - Main admin interface
- [ ] `/blogs` - Public blog listing
- [ ] Middleware for auth protection

## Components
- [ ] `ConfigEditor` - Edit system prompt
- [ ] `BlogEditor` - Create/edit blogs  
- [ ] `BlogList` - Display blog posts

## External Integrations
- [ ] OpenAI API client for content generation
- [ ] Resend API for email sending
- [ ] Vercel Cron for biweekly scheduling

## Deployment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Set up cron job (every 2 weeks)
- [ ] Deploy and test