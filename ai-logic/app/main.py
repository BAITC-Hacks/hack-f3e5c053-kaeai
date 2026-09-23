import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.ai_logic import analyze_problem, generate_challenge


load_dotenv()

app = FastAPI(title="AI Sana Challenge Hub AI Service", version="1.0.0")
configured_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
allowed_origins = sorted(set(configured_origins + ["http://localhost:3000", "http://127.0.0.1:3000"]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=5000)


class GenerateRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=5000)
    answers: dict[str, str] = Field(default_factory=dict)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "AI Sana Challenge Hub AI service is running"}


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest) -> dict:
    return analyze_problem(request.description)


@app.post("/api/generate")
def generate(request: GenerateRequest) -> dict:
    return generate_challenge(request.description, request.answers)
