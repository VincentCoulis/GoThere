# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoThere is a "destination engine" — users assign a human-readable phrase to any URL, and anyone can type that phrase to be redirected to the correct page. It bridges the gap between the offline and online worlds (printed materials, spoken URLs, signage, etc.).

## Tech Stack

- **Next.js 16** (App Router, Turbopack) with TypeScript
- **Tailwind CSS v4** (PostCSS plugin, no `tailwind.config` — uses CSS-first configuration)
- **Supabase** (PostgreSQL database, Auth, Row Level Security)
- **@supabase/ssr** for server-side Supabase client with cookie-based auth
- **Resend SMTP** for transactional email (magic link auth) on `gothere.cc`

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (flat config)
```

## Architecture

### Core Data Flow

1. User types a phrase on the home page (`/`) and hits "Go"
2. Client navigates to `/go/{phrase}` (dynamic API route)
3. Route handler queries Supabase for a matching `destinations` row (case-insensitive)
4. If found → HTTP redirect to the stored URL. If not → redirect back to `/?q={phrase}`

### Routes

| Route | Type | Auth | Purpose |
|-------|------|------|---------|
| `/` | Static (client) | No | Search box with autocomplete suggestions |
| `/go/[phrase]` | Dynamic (server) | No | Phrase lookup → redirect to URL |
| `/login` | Static (client) | No | Magic link email sign-in |
| `/auth/callback` | Dynamic (server) | — | Exchanges auth code for session |
| `/auth/signout` | Dynamic (server) | — | Destroys session, redirects to `/` |
| `/create` | Static (client) | Yes | Form to create a new destination |
| `/dashboard` | Dynamic (server) | Yes | List/edit/delete/toggle user's destinations |
| `/api/suggest` | Dynamic (server) | No | JSON autocomplete (query param `?q=`) |
| `/dashboard/review` | Dynamic (server) | Admin | Review queue for flagged destinations |

### Key Directories

```
src/
  app/
    page.tsx                  # Home — search with autocomplete (client component)
    go/[phrase]/route.ts      # Redirect route handler (server)
    login/page.tsx            # Magic link sign-in (client component)
    create/page.tsx           # Create destination form (client component)
    create/actions.ts         # Server action: validate + insert destination
    dashboard/page.tsx        # User's destinations list (server component)
    dashboard/actions.ts      # Server actions: update/delete/toggle
    dashboard/destination-row.tsx  # Editable row (client component)
    dashboard/review/page.tsx     # Admin review queue (server component)
    dashboard/review/actions.ts   # Server actions: approve/reject destinations
    dashboard/review/review-row.tsx # Review row with approve/reject (client component)
    api/suggest/route.ts      # Autocomplete API
    auth/callback/route.ts    # Auth code exchange
    auth/signout/route.ts     # Sign out
  lib/
    supabase/client.ts        # Browser Supabase client (createBrowserClient)
    supabase/server.ts        # Server Supabase client (createServerClient + cookies)
    supabase/middleware.ts     # Session refresh helper for middleware
    auth.ts                   # requireUser(), isAdmin(), requireAdmin() — auth helpers
    safety/scan.ts            # Layered URL safety scan (Safe Browsing → heuristics → Gemini)
    safety/heuristic.ts       # Local pattern matching for phishing signals
    safety/gemini-scan.ts     # Gemini Flash AI URL analysis
    safety/safe-browsing.ts   # Google Safe Browsing API check
    validate-url.ts           # URL + phrase validation (protocol whitelist, length limits)
  middleware.ts               # Next.js middleware — refreshes Supabase auth session
  types/database.ts           # TypeScript types for Supabase tables
supabase/migrations/          # SQL migrations (run against Supabase project)
```

### Supabase Setup

- Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key
- Migrations in `supabase/migrations/` define the `destinations` table with RLS policies
- The `destinations` table uses case-insensitive phrase lookups via `ilike`
- RLS: public read for active destinations (`is_active = true AND status = 'active'`), owners can read all their own rows, authenticated insert/update for owners

### Patterns

- **Server vs Client Supabase clients**: Use `@/lib/supabase/server` in Server Components/Route Handlers and `@/lib/supabase/client` in Client Components
- **Auth protection**: Use `requireUser()` from `@/lib/auth` in server components and server actions — it redirects to `/login` if not authenticated. Use `requireAdmin()` for admin-only pages (checks `ADMIN_EMAIL` env var).
- **URL validation**: All user-submitted URLs go through `validateUrl()` from `@/lib/validate-url` — only `http:` and `https:` protocols allowed, must have a real domain, max 2048 chars. This prevents open redirect attacks.
- **Server Actions**: Mutation forms use React 19 `useActionState` with server actions (see `create/actions.ts`, `dashboard/actions.ts`)
- **Tailwind v4**: Styles are configured in `src/app/globals.css` using `@import "tailwindcss"`, not a JS config file
- **Path alias**: `@/*` maps to `./src/*`
- **Middleware deprecation**: Next.js 16 shows a warning about middleware → proxy migration. The middleware still works but may need migration to the `proxy` convention in future

### Security Watchman (3-Layer URL Safety Scan)

Every URL submitted via `/create` or edited via `/dashboard` passes through the Security Watchman — a layered defense system in `src/lib/safety/`:

1. **Layer 1: Google Safe Browsing** (`safe-browsing.ts`) — checks against Google's known threat databases. If flagged → **hard block** (rejected outright, never inserted).
2. **Layer 2: Local Heuristics** (`heuristic.ts`) — `checkHeuristics()` performs instant pattern matching with zero API cost. Catches brand impersonation (leet-speak like `paypa1`), suspicious TLDs (`.tk`, `.zip`, `.mov`, etc.), deceptive subdomains, IP-address hostnames, and phishing path keywords. If flagged → **quarantine**.
3. **Layer 3: Gemini Flash AI** (`gemini-scan.ts`) — `scanWithGemini()` uses Gemini 2.0 Flash Lite for AI analysis of subtle deception patterns (typosquatting, homograph attacks, IDN tricks). If flagged → **quarantine**. Fails open if unavailable — Layers 1+2 still protect.

Orchestrated by `scan.ts` → `scanUrl()` runs all three layers in sequence.

Flagged URLs are inserted with `status: 'pending_review'` instead of `'active'`. They do not appear in search or redirects until an admin approves them at `/dashboard/review`.

### Destination Status & Soft Delete

The `destinations` table has a `status` column: `'active'` | `'pending_review'` | `'rejected'`
- Clean URLs → `status: 'active'` immediately
- Flagged URLs → `status: 'pending_review'` (quarantined)
- Admin can approve (`→ active`) or reject (`→ rejected`) at `/dashboard/review`
- Only `status = 'active'` rows appear in public queries (`/go/[phrase]`, `/api/suggest`)
- The `is_active` boolean is kept for user toggle on/off

**Soft delete:** Destinations are never hard-deleted. The `deleted_at` timestamp column is set via `deleteDestination()`. All queries filter with `.is("deleted_at", null)` to exclude soft-deleted rows. Soft-deleted phrases can be reclaimed.

**Click tracking:** The `/go/[phrase]` handler calls `supabase.rpc('increment_click_count', { target_id: data.id })` (fire-and-forget) after safety checks pass, before redirecting.

### Admin Dashboard

The `/dashboard/review` page is the primary interface for link management:
- Protected by `requireAdmin()` — admin identified by `ADMIN_EMAIL` env var + `app_config` table in Postgres
- `isAdmin(email)` and `requireAdmin()` in `src/lib/auth.ts`
- RLS uses a `public.is_admin()` SQL function (checks JWT email against `app_config` table)
- Lists all quarantined destinations with flag reasons
- Approve → sets `status: 'active'`, Reject → sets `status: 'rejected'`
- Admin sees a "Review (N)" link on the main dashboard

## Status

- **Core features:** Complete (phrase redirects, auth, create, dashboard, autocomplete, click tracking)
- **Security:** Defense-in-depth redirect validation, 3-layer Security Watchman with quarantine on both create and edit flows
- **Data:** Soft delete (`deleted_at` column), click tracking via `increment_click_count` RPC
- **Email:** Fully migrated to Resend SMTP for `gothere.cc`
- **Admin:** `/dashboard/review` is the primary interface for link management, RLS-backed via `is_admin()` SQL function + `app_config` table
- **Migrations:** 3 applied — `00001` (schema), `00002` (status/quarantine), `00003` (RLS fixes + admin policies + soft delete + click tracking)
