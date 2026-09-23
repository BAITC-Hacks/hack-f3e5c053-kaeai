"""Adapter between the marketplace API and the AI challenge service."""

from typing import Any

import httpx
from fastapi import HTTPException
from pydantic import ValidationError

from .config import get_settings
from .schemas import GeneratedChallenge


def _request_ai(path: str, payload: dict[str, Any]) -> dict[str, Any]:
    settings = get_settings()
    try:
        response = httpx.post(
            f"{settings.ai_service_url.rstrip('/')}{path}",
            json=payload,
            timeout=settings.ai_timeout_seconds,
        )
        response.raise_for_status()
        result = response.json()
        if not isinstance(result, dict):
            raise ValueError("Invalid AI response")
        return result
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(
            status_code=503,
            detail=f"AI service unavailable. Check that ai-logic is running. ({type(error).__name__})",
        ) from error


def analyze_problem(description: str) -> dict[str, Any]:
    result = _request_ai("/api/analyze", {"description": description})
    if not isinstance(result.get("questions"), list):
        raise HTTPException(status_code=502, detail="AI service returned invalid questions")
    return result


def generate_challenge(description: str, answers: dict[str, str]) -> tuple[GeneratedChallenge, int]:
    result = _request_ai("/api/generate", {"description": description, "answers": answers})
    try:
        challenge = GeneratedChallenge.model_validate(result["challenge"])
        score = max(0, min(100, int(result.get("score", 0))))
    except (KeyError, TypeError, ValueError, ValidationError) as error:
        raise HTTPException(status_code=502, detail="AI service returned an invalid challenge") from error
    return challenge, score


def regenerate_questions(description: str, previous_questions: list[str]) -> list[str]:
    result = _request_ai("/api/questions", {"description": description, "previous_questions": previous_questions})
    if result.get("provider_error"):
        raise HTTPException(status_code=503, detail="OpenAI is unavailable for regenerating questions")
    questions = result.get("questions")
    if not isinstance(questions, list) or not questions or not all(isinstance(item, str) for item in questions):
        raise HTTPException(status_code=502, detail="AI service returned invalid questions")
    return questions[:6]


def review_challenge(description: str, challenge: dict[str, Any]) -> dict[str, Any]:
    result = _request_ai("/api/review", {"description": description, "challenge": challenge})
    if result.get("provider_error"):
        raise HTTPException(status_code=503, detail="OpenAI is unavailable for quality review")
    return result


def improve_challenge(description: str, challenge: dict[str, Any], instruction: str) -> tuple[GeneratedChallenge, int]:
    result = _request_ai("/api/improve", {"description": description, "challenge": challenge, "instruction": instruction})
    if result.get("provider_error"):
        raise HTTPException(status_code=503, detail="OpenAI is unavailable for improving challenges")
    try:
        generated = GeneratedChallenge.model_validate(result["challenge"])
        score = max(0, min(100, int(result.get("score", 0))))
    except (KeyError, TypeError, ValueError, ValidationError) as error:
        raise HTTPException(status_code=502, detail="AI service returned an invalid challenge") from error
    return generated, score


def translate_challenge(challenge: dict[str, Any], target_language: str) -> GeneratedChallenge:
    result = _request_ai("/api/translate", {"challenge": challenge, "target_language": target_language})
    if result.get("provider_error"):
        raise HTTPException(status_code=503, detail="OpenAI is unavailable for translating challenges")
    try:
        return GeneratedChallenge.model_validate(result["challenge"])
    except (KeyError, TypeError, ValueError, ValidationError) as error:
        raise HTTPException(status_code=502, detail="AI service returned an invalid translation") from error
