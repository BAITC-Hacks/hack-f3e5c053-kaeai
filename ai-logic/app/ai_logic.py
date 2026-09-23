"""AI challenge analysis with OpenAI and a local fallback."""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any


logger = logging.getLogger(__name__)


DIMENSIONS: dict[str, dict[str, Any]] = {
    "problem_clarity": {"keywords": (), "question": "What specific problem should the team solve, and where does it happen?"},
    "target_users": {"keywords": ("customer", "user", "client", "employee", "staff", "agent", "patient", "student", "клиент", "пользователь", "сотрудник"), "question": "Who are the main users or people affected by this problem?"},
    "business_impact": {"keywords": ("cost", "revenue", "impact", "loss", "reduce", "increase", "save", "efficiency", "стоимость", "выручк", "влияние", "потер", "эконом", "эффектив"), "question": "What business impact does this problem have today?"},
    "current_process": {"keywords": ("currently", "current", "manual", "process", "workflow", "today", "existing", "сейчас", "текущ", "вручную", "процесс", "систем"), "question": "How is this handled today, and what is difficult about the current process?"},
    "expected_outcome": {"keywords": ("goal", "outcome", "improve", "build", "create", "want", "should", "need", "цель", "результат", "улучш", "создат", "нужн"), "question": "What outcome or solution would make this challenge successful?"},
    "constraints": {"keywords": ("budget", "privacy", "security", "legal", "constraint", "limit", "compliance", "бюджет", "приватн", "безопасн", "огранич", "закон", "срок"), "question": "What constraints must the solution respect (budget, privacy, systems, or policy)?"},
    "success_metrics": {"keywords": ("metric", "kpi", "%", "measure", "target", "hours", "minutes", "accuracy", "метрик", "измер", "цель", "час", "минут", "точност"), "question": "Which measurable metrics will be used to evaluate success?"},
    "available_data": {"keywords": ("data", "dataset", "database", "records", "feedback", "tickets", "csv", "данн", "датасет", "базе", "запис", "обращен"), "question": "What data is available, and can student teams access a safe sample?"},
    "timeline": {"keywords": ("week", "month", "deadline", "timeline", "days", "date", "by ", "недел", "месяц", "дедлайн", "срок", "дн", "дат"), "question": "What is the expected timeline or deadline for a proposed solution?"},
    "required_skills": {"keywords": ("skill", "python", "ai", "machine learning", "design", "api", "analytics", "developer", "навык", "машинн", "дизайн", "аналит", "разработчик"), "question": "What skills or roles would be especially useful on the student team?"},
}

SYSTEM_PROMPT = """You are an AI challenge architect for a student hackathon.
Analyze the business problem and return JSON only. Do not invent facts. If a
value is unknown, use an empty string or an empty array. Write user-facing
content in the same language as the input.

Return exactly this object:
{
  "score": 0, "missing_fields": [], "questions": [],
  "analysis": {"dimension": {"status": "present|missing", "note": "..."}},
  "challenge": {"title": "", "problem": "", "goal": "", "target_users": "",
    "expected_result": "", "success_metrics": [], "constraints": [],
    "recommended_skills": [], "tags": [], "quality_review": []}
}""".strip()


def _is_present(name: str, description: str) -> bool:
    if name == "problem_clarity":
        return len(description.split()) >= 8
    return any(re.search(rf"(?<!\w){re.escape(keyword)}", description) for keyword in DIMENSIONS[name]["keywords"])


def _local_challenge(description: str, answers: dict[str, str] | None = None) -> dict[str, Any]:
    answers = answers or {}
    return {
        "title": "AI challenge based on the submitted problem",
        "problem": description,
        "goal": answers.get("expected_outcome", "Create a practical prototype that addresses the described problem."),
        "target_users": answers.get("target_users", "People affected by the described process."),
        "expected_result": "A working prototype that can be demonstrated from input to result.",
        "success_metrics": ["Working end-to-end prototype", "Clear measurable improvement", "Useful result for target users"],
        "constraints": ["Use anonymized data", "Protect API keys and personal data", "Keep the MVP demonstrable"],
        "recommended_skills": ["Python", "AI / ML", "FastAPI", "React / Next.js"],
        "tags": ["AI", "Automation", "Hackathon"],
        "quality_review": ["Problem is described", "Missing details are identified", "Prototype scope is clear"],
    }


def _local_analysis(description: str) -> dict[str, Any]:
    text = description.lower().strip()
    analysis: dict[str, dict[str, str]] = {}
    missing_fields: list[str] = []
    for name in DIMENSIONS:
        present = _is_present(name, text)
        analysis[name] = {"status": "present" if present else "missing", "note": "Information detected." if present else "Please provide more detail."}
        if not present:
            missing_fields.append(name)
    return {
        "score": round((len(DIMENSIONS) - len(missing_fields)) * 100 / len(DIMENSIONS)),
        "missing_fields": missing_fields,
        "questions": [DIMENSIONS[name]["question"] for name in missing_fields[:6]],
        "analysis": analysis,
        "challenge": _local_challenge(description),
    }


def _score_from_analysis(analysis: dict[str, Any]) -> int:
    present = sum(item.get("status") == "present" for item in analysis.values() if isinstance(item, dict))
    return round(present * 100 / len(DIMENSIONS))


def _llm_analysis(description: str, provider: str, answers: dict[str, str] | None = None) -> dict[str, Any]:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY") if provider == "openai" else os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise RuntimeError(f"{provider.upper()}_API_KEY is not configured")
    model = os.getenv("OPENAI_MODEL", "gpt-4.1")
    base_url = os.getenv("OPENAI_BASE_URL") or None

    client = OpenAI(api_key=api_key, base_url=base_url, timeout=float(os.getenv("AI_TIMEOUT_SECONDS", "30")))
    user_prompt = f"Business problem:\n{description}"
    if answers:
        user_prompt += "\n\nClarification answers:\n" + json.dumps(answers, ensure_ascii=False)
    request: dict[str, Any] = {
        "model": model,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        "temperature": 0.2,
    }
    request["response_format"] = {"type": "json_object"}
    response = client.chat.completions.create(**request)
    content = (response.choices[0].message.content or "{}").strip()
    if content.startswith("```"):
        content = content.strip("`").removeprefix("json").strip()
    result = json.loads(content)
    result["score"] = max(0, min(100, int(result.get("score", _score_from_analysis(result.get("analysis", {}))))))
    result["missing_fields"] = result.get("missing_fields", [])
    result["questions"] = result.get("questions", [])[:6]
    result["analysis"] = result.get("analysis", {})
    result["challenge"] = result.get("challenge") or _local_challenge(description, answers)
    result["provider"] = provider
    return result


def analyze_problem(description: str) -> dict[str, Any]:
    provider = os.getenv("AI_PROVIDER", "openai").lower()
    if provider == "openai":
        try:
            return _llm_analysis(description, provider)
        except Exception as error:
            logger.exception("AI analysis failed for provider=%s", provider)
            result = _local_analysis(description)
            result["provider"] = "local-fallback"
            result["provider_error"] = f"{type(error).__name__}: {error}"
            return result
    result = _local_analysis(description)
    result["provider"] = "local"
    return result


def generate_challenge(description: str, answers: dict[str, str]) -> dict[str, Any]:
    provider = os.getenv("AI_PROVIDER", "openai").lower()
    if provider == "openai":
        try:
            return _llm_analysis(description, provider, answers)
        except Exception as error:
            logger.exception("AI challenge generation failed for provider=%s", provider)
            result = _local_analysis(description)
            result["challenge"] = _local_challenge(description, answers)
            result["provider"] = "local-fallback"
            result["provider_error"] = f"{type(error).__name__}: {error}"
            return result
    result = _local_analysis(description)
    result["challenge"] = _local_challenge(description, answers)
    result["provider"] = "local"
    return result
