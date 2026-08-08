# Veracity AI — Local Development and Run Guide

This README explains how to install, run, test, and troubleshoot the Veracity AI mini-project on a Windows development machine (the repo was tested here). It also documents the root npm scripts that were added to make running the multi-service project easy.

---

## What this repository contains
- `frontend/` — Next.js application (React + Prisma client)
- `backend_django/` — Django REST backend (simple verifier)

A repo-level `package.json` was added to provide convenient scripts that operate across the monorepo.

---

## Prerequisites
- Node.js (v16+ recommended; tested with v24 on this machine)
- npm (comes with Node)
- Python 3.11+ (tested with Python 3.14)
- git (optional)

Make sure `python` (or `python.exe`) and `node` are available on PATH.

---

## Quick setup (recommended)
Open a terminal at the repository root (e.g. `C:\Users\<you>\OneDrive\Desktop\Veracity AI`) and run:

1. Install frontend dependencies

   npm run install:frontend

2. Install backend dependencies

   npm run install:backend

3. (Optional) Install backend dev/test deps

   npm run install:backend:dev

4. Start both servers (frontend + backend)

   npm run dev

This `dev` script uses `concurrently` and starts:
- Frontend: Next.js dev server on http://127.0.0.1:3000 (webpack mode)
- Backend: Django dev server on http://127.0.0.1:8000

If you prefer to run them separately (two terminals):

- Frontend only
  cd frontend
  npm run dev -- --hostname 127.0.0.1 --port 3000 --webpack

- Backend only
  cd backend_django
  python manage.py runserver 127.0.0.1:8000

---

## Useful repo-level npm scripts
Run these from the repository root:
- `npm run dev` — run frontend and backend together (recommended for local dev)
- `npm run install:frontend` — runs `cd frontend && npm install`
- `npm run install:backend` — installs Python packages from `backend_django/requirements.txt`
- `npm run install:backend:dev` — installs `requirements-dev.txt`
- `npm run frontend:dev` — start frontend dev server (webpack)
- `npm run backend:run` — install backend deps and run Django server
- `npm run test:backend` — run backend tests (pytest)

---

## Run the smoke checks (what was validated)
- GET http://127.0.0.1:3000  -> 200 OK (frontend served)
- POST http://127.0.0.1:3000/api/verify  -> API route works (forwards to backend and saves checks)
- Direct backend POST http://127.0.0.1:8000/api/verify/ -> 200 OK
- `npm run test:backend` -> runs pytest (a smoke test was added)

---

## Troubleshooting
1. "npm ERR! enoent Could not read package.json"
   - Means you ran `npm` in a folder without `package.json`. A repo-level `package.json` has been added so running `npm run <script>` at the repo root should now work.

2. "EADDRINUSE: address already in use 127.0.0.1:3000"
   - Some process is already bound to port 3000. Use PowerShell to find and stop it:
     - Find listening process:
       Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess -Unique
       Get-Process -Id <PID>
     - Stop process (replace <PID>):
       Stop-Process -Id <PID> -Force
   - Then re-run `npm run dev`.

3. Next.js Turbopack panic / permission error
   - If you see a Turbopack permission panic (Access is denied, os error 5), use webpack for dev with the `--webpack` flag. The repo dev scripts already use webpack to avoid this.

4. "DDG detected an anomaly" (DuckDuckGo search tool rate-limit)
   - The frontend's verify flow uses a web search tool that can be rate-limited by external services (DuckDuckGo). If you see this message the code still continues, but returned fewer or no search results. To mitigate: add retry/backoff in `src/lib/tools.js` or use a different search provider/API key.

5. Multiple lockfile warning from Next.js
   - Next.js may warn about multiple package-lock.json files. This is informational. To silence:
     - Remove the extra lockfile you don't want (e.g. remove repo-level `package-lock.json` if you prefer `frontend/package-lock.json`), or
     - Set `outputFileTracingRoot` in `next.config.js` per Next.js docs.

6. Prisma / DATABASE_URL
   - The frontend build script runs `prisma db push --force-reset` and `prisma generate`. That requires a `DATABASE_URL` in `.env` that points to a database accessible from your machine. The repository contains a `frontend/.env` with a DATABASE_URL — review it and do NOT commit any secrets if you change it. For local experiments you can provide a local Postgres URL or configure Prisma to use SQLite.

7. Python script warnings about scripts installed to Roaming\Python\PythonXXX\Scripts
   - Pip may install console scripts into the user Scripts folder that is not on PATH. Either add that folder to your PATH or call installed tools via `python -m <tool>` (example: `python -m pytest`). The repo scripts call pytest via `python -m pytest` to avoid this issue.

---

## Developer notes and recommendations
- Do NOT commit secret keys. There are environment files in the frontend — keep secrets local (e.g., `.env.local`) and add them to `.gitignore`.
- The CI workflow added (`.github/workflows/ci.yml`) runs backend tests and installs frontend deps. Frontend build is not executed in CI because it runs Prisma DB push which requires a database; if you want CI to build the frontend, configure DATABASE_URL for CI or adapt the build step.
- Consider switching the monorepo to npm workspaces if you plan to add more packages.

---

## If something still fails, run these checks
- Confirm Node and npm versions:
  node --version
  npm --version
- Confirm Python:
  python --version
- Check ports and processes (PowerShell):
  Get-NetTCPConnection -LocalPort 3000,8000 | Select-Object LocalPort,State,OwningProcess
  Get-Process -Id <PID>
- Check server logs (in the terminals where dev servers run) for runtime errors.

---

If you want, I can commit a minimal `.env.example` (without secrets) that documents the environment variables the project expects.
"# miniproject" 
