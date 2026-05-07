# AI Image Subscription App

Fullstack starter app with:

- Next.js frontend
- FastAPI backend
- Email/password login
- JWT auth
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
npm install
copy .env.example .env.local
npm run dev
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

- `SECRET_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`

Frontend:

- `NEXT_PUBLIC_API_URL`
