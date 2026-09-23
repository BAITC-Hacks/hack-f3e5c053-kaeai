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

LOCAL_QUESTIONS: dict[str, dict[str, str]] = {
    "ru": {
        "problem_clarity": "Какую конкретную проблему нужно решить и на каком этапе процесса она возникает?",
        "target_users": "Кто конкретно столкнулся с этой проблемой и кто будет пользоваться решением?",
        "business_impact": "Как проблема влияет на бизнес сегодня: деньги, время, качество или количество ошибок?",
        "current_process": "Как эту задачу выполняют сейчас и где именно текущий процесс тормозит?",
        "expected_outcome": "Какой результат должен получить пользователь после внедрения решения?",
        "constraints": "Какие ограничения нужно учесть: бюджет, безопасность, приватность, системы или правила?",
        "success_metrics": "По каким измеримым показателям вы поймёте, что решение успешно?",
        "available_data": "Какие данные уже доступны команде и можно ли предоставить безопасный тестовый набор?",
        "timeline": "Какой срок, этапы и дата демонстрации решения?",
        "required_skills": "Какие навыки или роли нужны команде для создания прототипа?",
    },
    "kk": {
        "problem_clarity": "Қандай нақты мәселені шешу керек және ол процестің қай кезеңінде пайда болады?",
        "target_users": "Бұл мәселе кімге әсер етеді және шешімді нақты кім қолданады?",
        "business_impact": "Бұл мәселе бизнеске қазір қалай әсер етеді: уақытқа, шығынға, сапаға немесе қателер санына?",
        "current_process": "Бұл міндет қазір қалай орындалады және қазіргі процестің қай жері қиын?",
        "expected_outcome": "Шешім енгізілгеннен кейін пайдаланушы қандай нақты нәтижеге қол жеткізуі керек?",
        "constraints": "Қандай шектеулерді ескеру қажет: бюджет, қауіпсіздік, құпиялылық, жүйелер немесе ережелер?",
        "success_metrics": "Шешімнің сәтті болғанын қандай өлшенетін көрсеткіштер арқылы анықтайсыз?",
        "available_data": "Қандай деректер қолжетімді және қауіпсіз тест деректерін ұсынуға бола ма?",
        "timeline": "Жобаның мерзімі, негізгі кезеңдері және демонстрация күні қандай?",
        "required_skills": "Прототипті жасау үшін командаға қандай дағдылар немесе рөлдер қажет?",
    },
    "en": {
        "problem_clarity": "What exact problem should the team solve, and where does it occur in the workflow?",
        "target_users": "Who is directly affected by this problem and who will use the solution?",
        "business_impact": "How does this problem affect the business today in time, cost, quality or errors?",
        "current_process": "How is this handled today, and where does the current process break down?",
        "expected_outcome": "What concrete result should users get after the solution is introduced?",
        "constraints": "What constraints must be respected: budget, security, privacy, systems or policy?",
        "success_metrics": "Which measurable indicators will show that the solution is successful?",
        "available_data": "What data is already available, and can a safe sample be shared with the team?",
        "timeline": "What is the timeline, key milestones and demo deadline for the project?",
        "required_skills": "Which skills or roles are needed to build the prototype?",
    },
}

SYSTEM_PROMPT = """You are the lead AI challenge architect for a student hackathon.
Your job is to turn a rough business idea into a clear, realistic and exciting
challenge. Return JSON only, with no markdown outside the JSON object.

LANGUAGE:
- Detect the dominant language of the user's description: Kazakh, Russian or English.
- Write every user-facing field in that same language, including questions,
  notes, title, challenge and quality review. Preserve Kazakh Cyrillic or Latin
  script when the user uses it. Never switch to English just because technical
  terms appear in the input.

QUALITY:
- Understand the actual domain and nouns in the description; do not give a
  generic questionnaire.
- Mark a dimension as present only when the user supplied meaningful evidence.
- Ask 3-6 specific questions only about the most important missing information.
- Every question must be different, answerable and directly tied to this idea.
  Avoid repeating questions about users, goals or metrics with different words.
- Prefer concrete details: workflow, actors, data, integrations, constraints,
  timeline, measurable success and MVP scope.
- Do not invent facts, users, numbers, datasets or technologies. Use an empty
  string or empty array when information is unknown.
- The `challenge.problem` field must faithfully restate the submitted problem;
  never replace it with a generic business problem or a different domain.
- `score` is an integer from 0 to 100, never a 0-10 rating. Calculate it from
  how many of the listed dimensions are genuinely supported by the input.
- Use the full useful detail from the input and clarification answers; do not
  impose an artificial word limit on the user-facing content.

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


def _detect_language(text: str) -> str:
    lowered = text.lower()
    if any(character in lowered for character in "әғқңөұүһі"):
        return "kk"
    if re.search(r"[а-яё]", lowered):
        return "ru"
    return "en"


def _question_for(name: str, language: str) -> str:
    return LOCAL_QUESTIONS.get(language, LOCAL_QUESTIONS["en"]).get(name, DIMENSIONS[name]["question"])


def _clean_questions(questions: Any, limit: int = 6) -> list[str]:
    if not isinstance(questions, list):
        return []
    cleaned: list[str] = []
    seen: set[str] = set()
    for question in questions:
        if not isinstance(question, str):
            continue
        value = " ".join(question.split()).strip()
        key = value.casefold().rstrip("?!.")
        if value and key not in seen:
            seen.add(key)
            cleaned.append(value)
    return cleaned[:limit]


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
    language = _detect_language(description)
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
        "questions": [_question_for(name, language) for name in missing_fields[:6]],
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
        "temperature": 0.4,
        "max_tokens": 4000,
    }
    request["response_format"] = {"type": "json_object"}
    response = client.chat.completions.create(**request)
    content = (response.choices[0].message.content or "{}").strip()
    if content.startswith("```"):
        content = content.strip("`").removeprefix("json").strip()
    result = json.loads(content)
    model_score = int(result.get("score", 0) or 0)
    calculated_score = _score_from_analysis(result.get("analysis", {}))
    result["score"] = calculated_score if 0 < model_score < 10 and calculated_score >= 10 else max(0, min(100, model_score or calculated_score))
    result["missing_fields"] = result.get("missing_fields", [])
    result["questions"] = _clean_questions(result.get("questions"))
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
