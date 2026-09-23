# AI Sana Challenge Hub Backend

FastAPI modular monolith for the Challenge Hub MVP. PostgreSQL is started through Docker Compose.

## Run

```bash
copy .env.example .env
docker compose up --build
```

API documentation is available at `http://localhost:8000/docs`.

Without `OPENAI_API_KEY`, the generation endpoint uses a deterministic fallback so the demo flow still works.

## Main endpoints

- `GET /health`
- `POST /api/challenges`
- `GET /api/challenges/{id}`
- `POST /api/challenges/{id}/answers`
- `POST /api/challenges/{id}/generate`
- `POST /api/challenges/{id}/publish`
- `GET /api/challenges?status=published`
- `POST /api/challenges/{id}/applications`
- `GET /api/challenges/{id}/applications`
