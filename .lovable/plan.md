# Move to a fresh Lovable Cloud backend

Provision a brand new backend for this project through Lovable Cloud and point the app at it instead of the currently configured external project (`hheucdzlnxsjcuysdezb`).

## What happens

1. Enable Lovable Cloud, which provisions a new database, auth, storage and secrets for this project.
2. `.env` and `supabase/config.toml` are rewritten automatically with the new project id, URL and publishable key. The generated client files keep working unchanged.
3. Re-apply the existing schema (60 migration files under `supabase/migrations`) to the new database so all tables, functions, RLS policies and grants exist again: properties, bookings, invoices, contracts, expenses, content templates, property settings, user roles, API clients, staff/housekeeping tables and the related RPCs.
4. Verify the app boots: admin routes load, auth sign-in works, public `/api/public/v1/*` and staff `/api/staff/v1/*` endpoints respond.

## Important consequences

- **No data is copied.** The new database starts empty: no bookings, properties, invoices, uploaded images or user accounts. You will need to create an admin account again and re-enter (or separately export/import) content.
- **Storage files** (property images, PDFs) are not transferred; existing image URLs pointing at the old project will break.
- **Secrets must be re-added**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LOVABLE_API_KEY` and any other integration keys.
- **API keys for the public API** (`api_clients`) are stored as hashes and cannot be migrated; new keys must be generated and handed to the client-side app.
- Any external systems (iCal sync URLs, cron callers, the separate client-facing Lovable app) will need the new API keys.

## Technical notes

- Migration files are re-run in timestamp order against the new project; each `CREATE TABLE public.*` already carries its `GRANT` + RLS + policy block, so no rewrite is needed.
- If any migration fails because it was written against drifted state on the old project, it is fixed in place and re-applied.
- `src/integrations/supabase/types.ts` is regenerated from the new database.
- Server code (`createServerFn`, `client.server.ts`, auth middleware) needs no changes — it reads `process.env` values that Cloud injects.

## Before I start

Confirm you accept an empty database (option: I can also extract the current data as SQL inserts first, if you can grant access to the old project).
