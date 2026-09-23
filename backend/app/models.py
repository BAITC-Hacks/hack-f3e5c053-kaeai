from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    raw_description: Mapped[str] = mapped_column(Text)
    title: Mapped[str | None] = mapped_column(String(255))
    problem: Mapped[str | None] = mapped_column(Text)
    goal: Mapped[str | None] = mapped_column(Text)
    target_users: Mapped[str | None] = mapped_column(Text)
    expected_result: Mapped[str | None] = mapped_column(Text)
    success_metrics: Mapped[list[str]] = mapped_column(JSONB, default=list)
    constraints: Mapped[list[str]] = mapped_column(JSONB, default=list)
    recommended_skills: Mapped[list[str]] = mapped_column(JSONB, default=list)
    readiness_score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    questions: Mapped[list["ClarificationQuestion"]] = relationship(back_populates="challenge", cascade="all, delete-orphan")
    applications: Mapped[list["Application"]] = relationship(back_populates="challenge", cascade="all, delete-orphan")


class ClarificationQuestion(Base):
    __tablename__ = "clarification_questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id", ondelete="CASCADE"))
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str | None] = mapped_column(Text)
    is_required: Mapped[bool] = mapped_column(default=True)

    challenge: Mapped[Challenge] = relationship(back_populates="questions")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id", ondelete="CASCADE"))
    team_name: Mapped[str] = mapped_column(String(255))
    team_description: Mapped[str] = mapped_column(Text)
    contact: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    challenge: Mapped[Challenge] = relationship(back_populates="applications")
