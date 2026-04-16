# Youssef Selk Portfolio (Next.js + Custom CMS)

Professional portfolio inspired by The Verge style, with a **fully custom private CMS** built inside the app (no external CMS service).

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Custom Admin CMS (`/admin`)
- SQLite auth database (`data/auth.db`)
- File-based content store (`data/portfolio-content.json`)

## Features

- Hidden back-office route: unauthenticated `/admin` returns `404`
- SQLite-backed admin users table
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
- `ADMIN_DB_PATH` (filename only, default: `auth.db`, stored under `data/`)
- `ADMIN_SESSION_SECRET` (long random string, required in production)
- `ADMIN_BOOTSTRAP_USERNAME` (optional for script)
- `ADMIN_BOOTSTRAP_PASSWORD` (optional for script)

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

Content is stored in `data/portfolio-content.json` and auth in `data/auth.db`.

- Works great locally and on traditional Node hosting with persistent disk.
- On serverless/ephemeral filesystems, file writes may not persist.

## Deployment

1. Push repo to GitHub.
2. Deploy on your host/Vercel.
3. Set all environment variables.
4. Run `npm run admin:create -- <username> <password>` in deployment environment (or before first run if persistent disk).
5. Use `/auth/login` to access back office.
