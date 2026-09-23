from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["business", "student"]

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized:
            raise ValueError("Invalid email address")
        return normalized


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: Literal["business", "student"]
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserResponse


class QuestionAnswer(BaseModel):
    question_id: int
    answer: str = Field(min_length=1)


class ChallengeCreate(BaseModel):
    description: str = Field(min_length=10, max_length=10000)


class ChallengeAnswers(BaseModel):
    answers: list[QuestionAnswer]


class ImproveRequest(BaseModel):
    instruction: str = Field(default="Make the MVP clearer and more actionable.", max_length=1000)


class TranslateRequest(BaseModel):
    target_language: Literal["kk", "ru", "en"]


class GeneratedChallenge(BaseModel):
    title: str
    problem: str
    goal: str
    target_users: str
    expected_result: str
    success_metrics: list[str]
    constraints: list[str]
    recommended_skills: list[str]


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    answer: str | None
    is_required: bool


class ChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int | None
    raw_description: str
    title: str | None
    problem: str | None
    goal: str | None
    target_users: str | None
    expected_result: str | None
    success_metrics: list[str]
    constraints: list[str]
    recommended_skills: list[str]
    readiness_score: int
    status: Literal["draft", "ready", "published"]
    questions: list[QuestionResponse]
    created_at: datetime
    updated_at: datetime


class ApplicationCreate(BaseModel):
    team_name: str = Field(min_length=1, max_length=255)
    team_description: str = Field(min_length=1)
    contact: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)


class ApplicationResponse(ApplicationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    challenge_id: int
    student_id: int | None
    status: Literal["pending", "selected", "rejected"]
    created_at: datetime
