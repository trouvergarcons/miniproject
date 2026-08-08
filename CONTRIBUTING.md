# Contributing to Veracity AI

Thanks for taking an interest in contributing! This file contains quick instructions for setting up a local dev environment, running tests, and submitting changes.

1. Set up development environment
   - Install Node.js (v16+ recommended) and npm
   - Install Python 3.11+ and ensure `python` is on PATH

2. Install dependencies
   From repository root:
   - `npm run install:frontend`
   - `npm run install:backend`
   - (optional) `npm run install:backend:dev` to install dev/test tools

3. Running the project locally
   - `npm run dev` — starts both frontend (http://127.0.0.1:3000) and backend (http://127.0.0.1:8000)
   - Or run in separate terminals:
     - `npm run frontend:dev` (from repo root)
     - `npm run backend:run` (from repo root)

4. Running tests
   - `npm run test:backend` (runs pytest for backend)

5. Environment variables
   - See `frontend/.env.example` for the required frontend env vars. Do not commit secrets — add your `.env.local` to .gitignore.

6. Code style
   - Python: use `black` and `flake8` (installed by `install:backend:dev`)

7. Opening a PR
   - Fork the repo, create a topic branch, make changes, run tests locally, push, and open a PR with a clear description.

If you need help setting up your environment, open an issue describing your OS and what went wrong. Thank you!