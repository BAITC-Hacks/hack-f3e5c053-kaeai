# AI Sana Challenge Hub

AI Sana Challenge Hub turns a short business problem into a structured student challenge.

## Components

- `apps/frontend` - Next.js interface for submitting a problem, answering clarification questions, and reviewing the generated challenge.
- `ai-logic` - FastAPI service with local analysis plus optional OpenAI and NVIDIA providers.

## Run locally

Terminal 1:

```powershell
cd ai-logic
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Terminal 2:

```powershell
cd apps\frontend
npm install
npm run dev
```

Open http://localhost:3000 and use the Create a challenge flow.

## AI providers

Copy `ai-logic/.env.example` to `ai-logic/.env`. The default `AI_PROVIDER=local` uses no credits. Set `AI_PROVIDER=openai` or `AI_PROVIDER=nvidia` after adding the corresponding key. Keep `.env` out of GitHub.

The frontend calls `POST /api/analyze` first and `POST /api/generate` after clarification answers are submitted.
