# Youssef Selk Portfolio (Next.js + Custom CMS)

Professional portfolio inspired by The Verge style, with a **fully custom private CMS** built inside the app (no external CMS service).

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Custom Admin CMS (`/admin`)
- Supabase Postgres auth/content storage

## Features

- Hidden back-office route: unauthenticated `/admin` returns `404`
- Postgres-backed admin users table
- Password hashing with scrypt
- Signed HTTP-only session cookie auth
- Private API for content updates
- Live preview panel while editing
- Fast homepage with cached content and instant refresh after save

## Editable content

- Landing hero, about, section titles, contact, footer
- Social links, stats, languages
- Experience, education, projects, skills, certifications

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SITE_URL` (example: `http://localhost:3000`)
- `DATABASE_URL` (Supabase/Postgres connection string)
- `ADMIN_SESSION_SECRET` (long random string, required in production)
- `ADMIN_BOOTSTRAP_USERNAME` (optional for script)
- `ADMIN_BOOTSTRAP_PASSWORD` (optional for script)
- `SUPABASE_URL` (optional, for client-side Supabase usage)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional, for client-side Supabase usage)

## Create admin user

Use the script once to create/update your admin account:

```bash
npm run admin:create -- <username> <password>
```

Or set bootstrap env vars and run:

```bash
npm run admin:create
```

## Run locally

```bash
npm install
npm run dev
```

Open:

- Portfolio: `http://localhost:3000`
- Login: `http://localhost:3000/auth/login`
- Admin: `http://localhost:3000/admin`

## Security model

- `/admin/*` and `/api/admin/*` require a valid signed session.
- Requests without session receive `404` (admin route stays hidden).
- `/studio/*` is explicitly hidden (`404`).
- Session cookie is HTTP-only, SameSite strict, secure in production.
- Passwords are never stored in plain text.

## Persistence note

Auth and CMS content are stored in Postgres, so they persist correctly across serverless instances.

## Deployment

1. Push repo to GitHub.
2. Deploy on your host/Vercel.
3. Set all environment variables.
4. Run `npm run admin:create -- <username> <password>` in deployment environment.
5. Use `/auth/login` to access back office.

## CI/CD (GitHub Actions + Vercel)

This repository includes an automated Vercel pipeline at `.github/workflows/vercel-deploy.yml`:

- Pull requests to `main`: build and deploy a Preview environment.
- Pushes to `main`: build and deploy Production.

Add these GitHub repository secrets before running the workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

How to get them:

1. `VERCEL_TOKEN`: Vercel Dashboard -> Settings -> Tokens -> Create Token.
2. `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: run `vercel link` locally, then read `.vercel/project.json`.

After adding secrets, push to `main` or open a PR to trigger deployment.
