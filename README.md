# Berare — Cosmetics Ecommerce + Affiliate Platform

Monorepo for three independently-deployed Next.js apps sharing one Supabase
project. See `C:\Users\nivin\.claude\plans\moonlit-cuddling-cerf.md` for the
full implementation plan and `docs/open-business-decisions.md` for pending
business-rule decisions.

## Structure

```
apps/
  storefront/    customer-facing store — http://localhost:3000
  admin/         staff dashboard        — http://localhost:3001
  affiliate/     affiliate portal       — http://localhost:3002
packages/
  db/            Supabase client factories (browser/server/service-role)
  shared/        cross-app constants (attribution cookie/param names, enums)
supabase/
  migrations/    SQL migrations, source of truth for the schema
```

## Local setup

0. This repo requires Node ≥22 (`@supabase/supabase-js` requires it). It's
   scoped manually via `nvm-windows`, not automatically per-directory — run
   `nvm use 22.23.2` before working here, and `nvm use 20.19.0` (or whatever
   version your other projects need) when you switch away. `.nvmrc` and the
   root `package.json` `engines` field document the required version.
1. Install dependencies (from the repo root, not inside an app):
   ```
   npm install
   ```
2. Start Docker Desktop, then start the local Supabase stack:
   ```
   npx supabase start
   ```
   This prints local `API URL` and `anon key` values — copy each app's
   `.env.example` to `.env.local` and fill them in (`admin` also needs the
   printed `service_role key`).
3. Apply migrations to the local stack:
   ```
   npx supabase db reset
   ```
   This also runs `supabase/seed.sql`, which creates two test accounts:
   - Admin: `admin@berare.test` / `berare-admin-dev`
   - Customer: `customer@berare.test` / `berare-customer-dev`
4. Run an app:
   ```
   npm run dev:storefront   # or dev:admin / dev:affiliate
   ```

## Local auth testing

- **Email OTP** (storefront/affiliate): works immediately for any address —
  local Supabase catches outgoing email in Inbucket rather than sending it.
  `supabase start` prints the Inbucket URL; open it to read the 6-digit
  code after requesting one.
- **Google Sign-In**: needs a real Google Cloud OAuth client (client ID +
  secret) configured in the Supabase dashboard under Auth > Providers —
  not yet set up. Email OTP and the seeded admin password login both work
  without it.
- **Admin**: sign in with the seeded `admin@berare.test` account above.

## Commands

- `npm run typecheck` — `tsc --noEmit` across all three apps
- `npm run build` — production build of all three apps
- `npx supabase gen types typescript --local > packages/db/src/types.ts` —
  regenerate DB types after any migration change

