# AI Image Subscription App

Fullstack starter app with:

- Next.js frontend
- FastAPI backend
- Supabase Auth
- Supabase Postgres
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

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Frontend:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Railway + Supabase

Production setup for this project:

- Deploy `frontend` to Vercel
- Deploy `backend` to Railway
- Use Supabase Postgres for `DATABASE_URL`
- Use Supabase Auth for user sign-in

For Supabase database connections, use the project connection string from the dashboard. For a persistent backend like Railway, Supabase recommends the pooler session mode when you need broad network compatibility.

Railway backend settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Backend env on Railway:

```env
DATABASE_URL=postgresql+psycopg://...
FRONTEND_URL=https://your-frontend.vercel.app
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Frontend env on Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

If you already created a local `app.db` with the old integer user schema, remove it before running the refactored local backend so SQLAlchemy can create the new Supabase-compatible tables.
