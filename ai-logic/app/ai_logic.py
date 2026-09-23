"""AI challenge analysis with OpenAI and a local fallback."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from typing import Any


logger = logging.getLogger(__name__)
_RESPONSE_CACHE: dict[str, dict[str, Any]] = {}


def _safe_error(error: Exception) -> str:
    """Return a useful error without ever exposing a secret token."""
    message = f"{type(error).__name__}: {error}"
    return re.sub(r"(?:sk-|nvapi-)[A-Za-z0-9_-]+", "[redacted-token]", message)


def _cache_key(action: str, payload: Any) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(f"{action}:{encoded}".encode("utf-8")).hexdigest()


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


def _clean_string_list(value: Any, limit: int = 12) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    seen: set[str] = set()
    for item in value:
        if not isinstance(item, str):
            continue
        item = " ".join(item.split()).strip()
        if item and item.casefold() not in seen:
            seen.add(item.casefold())
            result.append(item)
    return result[:limit]


def _normalise_result(result: Any, description: str, answers: dict[str, str] | None = None) -> dict[str, Any]:
    """Make the model response safe and predictable for the frontend."""
    if not isinstance(result, dict):
        raise ValueError("The model returned a non-object JSON response")

    analysis = result.get("analysis") if isinstance(result.get("analysis"), dict) else {}
    challenge = result.get("challenge") if isinstance(result.get("challenge"), dict) else {}
    fallback = _local_challenge(description, answers)
    challenge_fields = (
        "title", "problem", "goal", "target_users", "expected_result",
        "success_metrics", "constraints", "recommended_skills", "tags", "quality_review",
    )
    for field in challenge_fields:
        value = challenge.get(field)
        if field in {"success_metrics", "constraints", "recommended_skills", "tags", "quality_review"}:
            cleaned = _clean_string_list(value)
            challenge[field] = cleaned or fallback[field]
        elif isinstance(value, str) and value.strip():
            challenge[field] = value.strip()
        else:
            challenge[field] = fallback[field]

    score = result.get("score", 0)
    try:
        score = int(score)
    except (TypeError, ValueError):
        score = 0
    calculated_score = _score_from_analysis(analysis)
    if 0 < score < 10 and calculated_score >= 10:
        score = calculated_score
    result["score"] = max(0, min(100, score or calculated_score))
    result["missing_fields"] = _clean_string_list(result.get("missing_fields"), limit=10)
    result["questions"] = _clean_questions(result.get("questions"))
    if not result["questions"]:
        language = _detect_language(description)
        result["questions"] = [_question_for(name, language) for name in result["missing_fields"][:6]]
    result["analysis"] = analysis
    result["challenge"] = challenge
    return result


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

    # NVIDIA is intentionally not used by this integration. Keeping one provider
    # avoids silently sending requests to a second API with incompatible output.
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(f"{provider.upper()}_API_KEY is not configured")
    model = os.getenv("OPENAI_MODEL", "gpt-4.1")
    base_url = os.getenv("OPENAI_BASE_URL") or None

    client = OpenAI(api_key=api_key, base_url=base_url, timeout=float(os.getenv("AI_TIMEOUT_SECONDS", "30")))
    language_name = {"en": "English", "ru": "Russian", "kk": "Kazakh"}[_detect_language(description)]
    user_prompt = f"Required language for every user-facing field: {language_name}.\nBusiness problem:\n{description}"
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
    try:
        result = json.loads(content)
        result = _normalise_result(result, description, answers)
        if _detect_language(description) == "en" and re.search(r"[\u0400-\u04ff]", result["challenge"]["title"]):
            raise ValueError("Model used the wrong response language")
    except (json.JSONDecodeError, ValueError, TypeError) as error:
        # One repair request handles occasional truncated or markdown-wrapped JSON.
        repair_request = dict(request)
        repair_request["messages"] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Return only valid JSON. Follow the required response language exactly.\n\n{user_prompt}"},
        ]
        repair_response = client.chat.completions.create(**repair_request)
        repaired = (repair_response.choices[0].message.content or "{}").strip().strip("`").removeprefix("json").strip()
        result = _normalise_result(json.loads(repaired), description, answers)
        logger.warning("Repaired malformed model response after %s", type(error).__name__)
        response = repair_response
    usage = getattr(response, "usage", None)
    if usage:
        result["usage"] = {
            "prompt_tokens": getattr(usage, "prompt_tokens", 0) or 0,
            "completion_tokens": getattr(usage, "completion_tokens", 0) or 0,
            "total_tokens": getattr(usage, "total_tokens", 0) or 0,
        }
    result["model"] = model
    result["provider"] = provider
    return result


def _openai_json(system_prompt: str, user_prompt: str, max_tokens: int = 3000) -> dict[str, Any]:
    """Run a small structured OpenAI request for secondary AI actions."""
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    model = os.getenv("OPENAI_MODEL", "gpt-4.1")
    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        timeout=float(os.getenv("AI_TIMEOUT_SECONDS", "30")),
    )
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        temperature=0.3,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )
    content = (response.choices[0].message.content or "{}").strip().strip("`").removeprefix("json").strip()
    result = json.loads(content)
    if not isinstance(result, dict):
        raise ValueError("The model returned a non-object JSON response")
    result["provider"] = "openai"
    result["model"] = model
    usage = getattr(response, "usage", None)
    if usage:
        result["usage"] = {
            "prompt_tokens": getattr(usage, "prompt_tokens", 0) or 0,
            "completion_tokens": getattr(usage, "completion_tokens", 0) or 0,
            "total_tokens": getattr(usage, "total_tokens", 0) or 0,
        }
    return result


def improve_challenge(description: str, challenge: dict[str, Any], instruction: str = "Improve clarity and make the MVP more actionable.") -> dict[str, Any]:
    prompt = f"""Original problem:\n{description}\n\nCurrent challenge JSON:\n{json.dumps(challenge, ensure_ascii=False)}\n\nImprovement request:\n{instruction}"""
    system = SYSTEM_PROMPT + "\n\nImprove the existing challenge without changing its domain or inventing facts. Return the same JSON schema."
    try:
        result = _openai_json(system, prompt, max_tokens=4000)
        return _normalise_result(result, description)
    except Exception as error:
        logger.exception("AI challenge improvement failed")
        return {"challenge": challenge, "provider": "local-fallback", "provider_error": _safe_error(error)}


def translate_challenge(challenge: dict[str, Any], target_language: str) -> dict[str, Any]:
    languages = {"ru": "Russian", "kk": "Kazakh", "en": "English"}
    language = languages.get(target_language)
    if not language:
        raise ValueError("target_language must be ru, kk or en")
    system = f"Translate every user-facing value in this challenge to {language}. Preserve JSON keys, arrays and meaning. Return exactly {{\"challenge\": {{...translated challenge...}}}} as JSON."
    try:
        result = _openai_json(system, json.dumps(challenge, ensure_ascii=False), max_tokens=3000)
        translated = result.get("challenge")
        if not isinstance(translated, dict):
            translated = {key: value for key, value in result.items() if key in challenge}
        result["challenge"] = translated
        return result
    except Exception as error:
        logger.exception("AI challenge translation failed")
        return {"challenge": challenge, "provider": "local-fallback", "provider_error": _safe_error(error)}


def regenerate_questions(description: str, answers: dict[str, str] | None = None, previous_questions: list[str] | None = None) -> dict[str, Any]:
    """Generate a fresh, non-repeating set of clarifying questions."""
    answers = answers or {}
    previous_questions = previous_questions or []
    key = _cache_key("questions", {"description": description, "answers": answers, "previous_questions": previous_questions})
    if key in _RESPONSE_CACHE:
        return {**_RESPONSE_CACHE[key], "cached": True}
    previous = {question.casefold().strip() for question in previous_questions}
    language = {"en": "English", "ru": "Russian", "kk": "Kazakh"}[_detect_language(description)]
    try:
        result = _openai_json(
            f'Return JSON with exactly one key: {{"questions": ["..."]}}. Write 3-6 specific, distinct clarifying questions in {language}. Do not repeat any previous question.',
            f'Original idea:\n{description}\n\nAnswers so far:\n{json.dumps(answers, ensure_ascii=False)}\n\nPrevious questions to replace:\n{json.dumps(previous_questions, ensure_ascii=False)}',
            max_tokens=900,
        )
    except Exception as error:
        logger.exception("AI question regeneration failed")
        result = {"provider": "local-fallback", "provider_error": _safe_error(error), "questions": _local_analysis(description)["questions"]}
    result["questions"] = [question for question in _clean_questions(result.get("questions")) if question.casefold().strip() not in previous]
    if not result["questions"]:
        result["questions"] = [question for question in _local_analysis(description)["questions"] if question.casefold().strip() not in previous][:6]
    result["cached"] = False
    _RESPONSE_CACHE[key] = result
    return result


def review_challenge(description: str, challenge: dict[str, Any]) -> dict[str, Any]:
    """Score challenge readiness and identify concrete risks before publishing."""
    key = _cache_key("review", {"description": description, "challenge": challenge})
    if key in _RESPONSE_CACHE:
        return {**_RESPONSE_CACHE[key], "cached": True}
    system = '''You are a strict hackathon challenge reviewer. Return JSON only:
{"overall_score": 0, "scores": {"clarity": 0, "specificity": 0, "feasibility": 0, "measurability": 0, "mvp_scope": 0}, "strengths": [], "risks": [], "recommended_fixes": []}.
Use integers from 0 to 100. Write in the dominant language of the input. Do not invent facts.'''
    prompt = f"Problem:\n{description}\n\nChallenge:\n{json.dumps(challenge, ensure_ascii=False)}"
    try:
        result = _openai_json(system, prompt, max_tokens=1800)
        result["cached"] = False
        _RESPONSE_CACHE[key] = result
        return result
    except Exception as error:
        logger.exception("AI challenge review failed")
        return {"overall_score": 0, "scores": {}, "strengths": [], "risks": ["Quality review unavailable"], "recommended_fixes": [], "provider": "local-fallback", "provider_error": _safe_error(error)}


def analyze_problem(description: str) -> dict[str, Any]:
    provider = os.getenv("AI_PROVIDER", "openai").lower()
    if provider == "openai":
        try:
            return _llm_analysis(description, provider)
        except Exception as error:
            logger.exception("AI analysis failed for provider=%s", provider)
            result = _local_analysis(description)
            result["provider"] = "local-fallback"
            result["provider_error"] = _safe_error(error)
            return result
    result = _local_analysis(description)
    result["provider"] = "local"
    result["provider_error"] = "Unsupported AI_PROVIDER; using local fallback. Set AI_PROVIDER=openai."
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
            result["provider_error"] = _safe_error(error)
            return result
    result = _local_analysis(description)
    result["challenge"] = _local_challenge(description, answers)
    result["provider"] = "local"
    result["provider_error"] = "Unsupported AI_PROVIDER; using local fallback. Set AI_PROVIDER=openai."
    return result
