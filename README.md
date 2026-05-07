# AI Image Subscription App

Fullstack starter app with:

- Next.js frontend
- FastAPI backend
- Supabase Auth
- Supabase Data API
- 5 free image generations per user
- OpenAI image generation
- Stripe subscription checkout and webhook credit reset

## Structure

```text
.
├── backend
│   ├── app
│   │   ├── core
│   │   ├── routers
│   │   ├── services
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend
    ├── app
    ├── components
    ├── lib
    ├── package.json
    └── .env.example
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Before starting the backend the first time, run [backend/supabase_schema.sql](</C:/Users/11556/Documents/New project 2/backend/supabase_schema.sql>) in the Supabase SQL Editor. The backend now talks to Supabase through the Python client, so it does not auto-create tables anymore.

## Frontend Setup

```bash
cd frontend
npm.cmd install
copy .env.example .env.local
npm.cmd run dev
```

Open http://localhost:3000.

If Node.js is not available globally on this machine, this workspace includes a portable Node.js install at `.tools/node-v24.15.0-win-x64`.

In PowerShell from the project root:

```powershell
$env:Path = "$PWD\.tools\node-v24.15.0-win-x64;$env:Path"
cd frontend
npm.cmd run dev
```

If your PowerShell execution policy allows local scripts, `.\use-node.ps1` does the same PATH setup and prints the Node/npm versions.

## Stripe Webhook

For local development:

```bash
stripe listen --forward-to localhost:8000/api/billing/webhook
```

Copy the webhook signing secret into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

## Required Environment

Backend:

- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`
  Comma-separated allowed frontend origins, for example `http://localhost:3000,https://your-site.vercel.app`
- `SUPABASE_URL`
- `SUPABASE_KEY`

Frontend:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Railway + Supabase

Production setup for this project:

- Deploy `frontend` to Vercel
- Deploy `backend` to Railway
- Use Supabase Auth for user sign-in
- Use Supabase tables plus RLS for app data

This backend uses the Supabase Python client with `SUPABASE_URL` and `SUPABASE_KEY`, matching the Flask-style client pattern from the official Supabase Python docs.

Railway backend settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Backend env on Railway:

```env
FRONTEND_URL=http://localhost:3000,https://your-frontend.vercel.app
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=sb_publishable_or_sb_secret_key
```

Use `sb_publishable_...` when you want the backend to operate with user-scoped RLS only. Use `sb_secret_...` if you also want server-side webhook updates such as Stripe subscription status changes.

Frontend env on Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
