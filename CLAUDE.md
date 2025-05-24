# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server

### Code Quality
No specific lint or test commands are configured in package.json. Check with the user before running custom commands.

## Project Architecture

This is a **Japanese anonymous Q&A platform** built with Next.js 15 and Supabase. Users can post anonymous questions and receive answers from the community.

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe integration for premium features
- **Deployment**: Designed for Vercel

### Key Architecture Patterns

#### Environment Configuration
- Uses **Supabase Edge Functions** for environment variable management instead of .env.local
- Environment variables are managed via `functions/env-config/index.ts` (Deno-based edge function)
- Includes configurations for Stripe, OAuth providers, and future API integrations

#### Authentication & Routing
- Supabase Auth with SSR support (`@supabase/ssr`)
- Custom middleware for session management (`middleware.ts`)
- Protected routes under `/app/protected/`
- Social login support (Google, Twitter OAuth)

#### Database Schema
Core entities:
- **profiles**: User profiles with premium status and auth source tracking
- **questions**: Questions with short_id for sharing, open/closed status
- **answers**: Anonymous answers linked to questions
- **notifications**: System notifications for users
- **user_settings**: User preferences and configuration

#### Component Organization
- `/components/ui/` - Base UI components (shadcn/ui)
- `/components/layout/` - Layout components (Header, etc.)
- `/components/analytics/` - Analytics and tracking components
- `/app/` - App Router pages and API routes

#### Utility Structure
- `/utils/supabase/` - Supabase client configurations (client, server, middleware)
- `/utils/` - Business logic utilities (questions, answers, user management, moderation)
- `/lib/` - Shared libraries and hooks

#### API Routes
- `/app/api/auth/webhook/` - Auth webhooks
- `/app/api/stripe/` - Payment processing
- `/app/api/og/` - Open Graph image generation
- `/app/api/test-moderation/` - Content moderation

### Development Guidelines

#### Cursor Rules Integration
The project follows specific development patterns defined in `.cursor/rules/qlink-rule.mdc`:
- Respect existing code flow and project-specific conventions
- Focus on Next.js and Supabase expertise
- Write concise, clear logic without redundant code
- Always reference `/doc/` folder for project design requirements before implementing
- Use Supabase Edge Functions for environment variables, not .env.local
- Confirm implementation details before proceeding if less than 95% confident

#### Key Files to Reference
- `/doc/` - Complete project requirements and design specifications
- `/lib/types.ts` - TypeScript definitions for all data models
- `/utils/supabase/` - Database client configurations
- `middleware.ts` - Authentication middleware setup

### Premium Features
The application includes Stripe-based premium subscriptions with enhanced features for paying users.

### Internationalization
Primary language is Japanese (`ja`), with English support planned.

特に、エラーが発生してそれを解決しようとしている時は、よく調べてよくThinkしてメタ認知を働かせてコードの修正を行ってください。95%の確証を得るまでsequential thinkingを行ってください。