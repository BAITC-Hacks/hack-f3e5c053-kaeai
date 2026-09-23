import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.ai_logic import analyze_problem, generate_challenge, improve_challenge, regenerate_questions, review_challenge, translate_challenge


load_dotenv()


app = FastAPI(title="AI Sana Challenge Hub AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=5000)


class GenerateRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=5000)
    answers: dict[str, str] = Field(default_factory=dict)


class ImproveRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=12000)
    challenge: dict = Field(default_factory=dict)
    instruction: str = Field(default="Improve clarity and make the MVP more actionable.", max_length=1000)


class TranslateRequest(BaseModel):
    challenge: dict = Field(default_factory=dict)
    target_language: str = Field(..., pattern="^(ru|kk|en)$")


class QuestionsRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=12000)
    answers: dict[str, str] = Field(default_factory=dict)


class ReviewRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=12000)
    challenge: dict = Field(default_factory=dict)


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


@app.post("/api/improve")
def improve(request: ImproveRequest) -> dict:
    return improve_challenge(request.description, request.challenge, request.instruction)


@app.post("/api/translate")
def translate(request: TranslateRequest) -> dict:
    return translate_challenge(request.challenge, request.target_language)


@app.post("/api/questions")
def questions(request: QuestionsRequest) -> dict:
    return regenerate_questions(request.description, request.answers)


@app.post("/api/review")
def review(request: ReviewRequest) -> dict:
    return review_challenge(request.description, request.challenge)
