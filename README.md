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

### Generate TypeScript database types

After schema changes, regenerate the database types:

```bash
npm run db:types
```
