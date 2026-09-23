# AI Sana Challenge Hub Backend

FastAPI API for accounts, challenges and applications. It calls the AI service for challenge analysis and generation. PostgreSQL is started through Docker Compose.

## Run

```bash
copy .env.example .env
copy ai-logic/.env.example ai-logic/.env
docker compose up --build
```

API documentation is available at `http://localhost:8000/docs`.

The OpenAI key belongs in `ai-logic/.env`; the backend never reads it. Without a key, the AI service provides a local fallback for the basic creation flow.

## Main endpoints

- `GET /health`
- `POST /api/auth/register` - register as `business` or `student`
- `POST /api/auth/login` - receive a JWT access token
- `GET /api/auth/me` - return the authenticated user
- `POST /api/challenges`
- `GET /api/challenges/mine`
- `GET /api/challenges/{id}`
- `POST /api/challenges/{id}/answers`
- `POST /api/challenges/{id}/generate`
- `POST /api/challenges/{id}/questions/regenerate`
- `POST /api/challenges/{id}/improve`
- `POST /api/challenges/{id}/translate`
- `POST /api/challenges/{id}/review`
- `POST /api/challenges/{id}/publish`
- `GET /api/challenges?status=published`
- `POST /api/challenges/{id}/applications`
- `GET /api/challenges/{id}/applications`
- `POST /api/applications/{id}/select`

Protected endpoints expect `Authorization: Bearer <access_token>`.

- `business` can create, clarify, generate and publish only its own challenges, review their applications and select a team.
- `student` can browse the public marketplace and submit one application per challenge.
