# GoThere

Turn long, complicated links into simple phrases.

GoThere is a destination engine. Users assign a human-readable phrase to any URL, and anyone can type that phrase to be redirected to the correct page. It bridges the gap between the offline and online worlds — printed sheets, spoken links, signage, and anywhere URLs are hard to type.

**Live at [gothere.cc](https://gothere.cc)**

## How it works

1. A creator picks a phrase (e.g. "Nike UK mens t-shirts") and points it at a URL
2. Anyone types that phrase on GoThere and hits "Go"
3. They're instantly redirected to the destination

## Features

- **Phrase-based redirects** — case-insensitive, instant lookup
- **Autocomplete search** — suggestions as you type
- **Magic link auth** — passwordless sign-in via email
- **Dashboard** — create, edit, toggle, and delete your destinations
- **Click tracking** — see how many times each phrase has been used
- **3-layer security** — Google Safe Browsing, local heuristics, and Gemini AI scan every submitted URL
- **Admin review queue** — flagged URLs are quarantined until approved
- **QR codes** — generated on creation for print and sharing
- **Soft delete** — nothing is permanently lost; deleted phrases can be reclaimed

## Tech stack

- **Next.js 16** (App Router, Turbopack) with TypeScript
- **Tailwind CSS v4** (CSS-first configuration)
- **Supabase** (PostgreSQL, Auth, Row Level Security)
- **Resend SMTP** for transactional email on `gothere.cc`

## Getting started

```bash
# Install dependencies
npm install

# Copy env and fill in your Supabase credentials
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable key |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL (defaults to `https://gothere.cc`) |
| `GOOGLE_SAFE_BROWSING_API_KEY` | No | Enables Safe Browsing checks |
| `GEMINI_API_KEY` | No | Enables AI-powered URL analysis |
| `ADMIN_EMAIL` | No | Email address for admin access to review queue |

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Database

Migrations are in `supabase/migrations/`. The schema includes:

- `destinations` table with phrase, URL, click count, status, and soft delete
- Row Level Security policies for public read, owner write, and admin access
- `increment_click_count` RPC for fire-and-forget click tracking
- `is_admin()` SQL function backed by an `app_config` table

## Security

Every submitted URL passes through the Security Watchman:

1. **Google Safe Browsing** — known threat database check. Flagged = hard block.
2. **Local heuristics** — brand impersonation, suspicious TLDs, deceptive subdomains. Flagged = quarantine.
3. **Gemini Flash AI** — typosquatting, homograph attacks, IDN tricks. Flagged = quarantine. Fails open.

Quarantined destinations are held at `status: 'pending_review'` until an admin approves or rejects them.

## License

All rights reserved.
