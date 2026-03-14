## Cardiac Care AI

Next.js App Router project with Supabase authentication and database-backed patient workflows.

## Getting Started

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Workflow

This repo tracks database changes in `supabase/migrations/`.

### One-time setup

1. Log in to Supabase:

   ```bash
   npx supabase login
   ```

2. Initialize local Supabase project files if you have not already:

   ```bash
   npx supabase init
   ```

3. Link this repo to the hosted Supabase project:

   ```bash
   npm run db:link
   ```

### If the dashboard already has schema changes

If tables, policies, or columns were created directly in the Supabase dashboard, pull them into versioned migrations before making more schema changes locally:

```bash
npm run db:pull
```

### Normal schema change flow

1. Create a migration:

   ```bash
   npm run db:new -- add_vitals_table
   ```

2. Edit the generated SQL file in `supabase/migrations/`.

3. Apply pending migrations to the linked Supabase project:

   ```bash
   npm run db:push
   ```

### Local Supabase stack

If you want to run Supabase locally with Docker:

```bash
npm run db:start
npm run db:status
npm run db:stop
```

## Demo seeding

The demo seed flow is intentionally handled by a backend script instead of raw SQL inserts into `auth.users`.
This keeps the seed safe for the current schema, where `profiles`, `vitals`, `medications`, `care_plans`, `alerts`, and `follow_ups` all rely on valid `auth.users(id)` values.

### What it seeds

- 1 provider: `dr.maya.chen@demo.cardiaccare.app`
- 5 patients with distinct cardiac scenarios
- `profiles`
- `vitals`
- `medications`
- `medication_adherence`
- `care_plans`
- `follow_ups`
- `alerts` via the existing `sync_alerts_from_latest_vitals` trigger

### Required environment

Add these variables to `.env.local` before running the seed:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional:

```bash
DEMO_SEED_PASSWORD=DemoPass123!
DEMO_SEED_CREATE_USERS=true
```

`DEMO_SEED_CREATE_USERS=true` is the default. When enabled, the script creates any missing demo auth accounts through the Supabase Admin API. If you already created those demo users manually and want the script to fail instead of creating them, set `DEMO_SEED_CREATE_USERS=false`.

### How to run it

1. Make sure your schema is current:

   ```bash
   npm run db:push
   ```

2. Run the demo seed:

   ```bash
   npm run seed:demo
   ```

3. Sign in with:

   ```text
   dr.maya.chen@demo.cardiaccare.app
   ```

   Password:

   ```text
   DemoPass123!
   ```

### What the script does

- Resolves each demo user by email in `auth.users`
- Creates missing auth users safely through the Admin API when allowed
- Upserts matching `profiles`
- Deletes old demo rows for those patient IDs so reseeding is repeatable
- Inserts vitals history, medications, adherence, care plans, and follow-ups
- Lets the existing database trigger regenerate current `alerts` from the latest vitals

### Generate TypeScript database types

After schema changes, regenerate the database types:

```bash
npm run db:types
```
