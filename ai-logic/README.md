# AI Logic Service

FastAPI backend for AI Sana Challenge Hub. It analyzes a business problem,
asks targeted clarification questions, and generates a structured challenge.

## Providers

The service supports two modes:

- `local` - deterministic fallback with no API key or cost;
- `openai` - OpenAI Chat Completions through the official Python SDK;

Copy `.env.example` to `.env`, then set `AI_PROVIDER` and the matching key.
Never commit `.env` or API keys.

## Run

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

## Endpoints

- `GET /api/health` - service health;
- `POST /api/analyze` - readiness score, missing fields, and questions;
- `POST /api/generate` - final structured challenge using clarification answers.
- `POST /api/questions` - new clarifying questions;
- `POST /api/improve` - revise a generated challenge;
- `POST /api/translate` - translate to Kazakh, Russian or English;
- `POST /api/review` - quality score and risks.
