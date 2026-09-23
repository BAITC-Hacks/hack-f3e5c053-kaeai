from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class QuestionAnswer(BaseModel):
    question_id: int
    answer: str = Field(min_length=1)


class ChallengeCreate(BaseModel):
    description: str = Field(min_length=10, max_length=10000)


class ChallengeAnswers(BaseModel):
    answers: list[QuestionAnswer]


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
    created_at: datetime
