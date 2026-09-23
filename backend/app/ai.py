import json

from openai import OpenAI

from .config import get_settings
from .schemas import GeneratedChallenge


def _fallback_generation(description: str, answers: dict[str, str]) -> GeneratedChallenge:
    answer_text = " ".join(answer for answer in answers.values() if answer)
    context = f" Additional context: {answer_text}" if answer_text else ""
    return GeneratedChallenge(
        title="AI-Powered Business Challenge",
        problem=f"{description.strip()}{context}",
        goal="Build a practical prototype that addresses the described business problem.",
        target_users="The business team and the people affected by the current process.",
        expected_result="A working, demonstrable prototype with a clear user flow and measurable outcome.",
        success_metrics=["Reduce manual effort", "Improve process speed", "Demonstrate a measurable outcome"],
        constraints=["Use anonymized data only", "Prototype must be web-based", "Expose a clear API where applicable"],
        recommended_skills=["Python", "AI / ML", "NLP", "FastAPI"],
    )


def generate_challenge(description: str, answers: dict[str, str]) -> GeneratedChallenge:
    settings = get_settings()
    if not settings.openai_api_key:
        return _fallback_generation(description, answers)

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = {"description": description, "answers": answers}
    response = client.chat.completions.create(
        model=settings.openai_model,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "Return JSON with exactly these keys: title, problem, goal, target_users, "
                    "expected_result, success_metrics, constraints, recommended_skills. "
                    "The last three keys must be arrays of strings."
                ),
            },
            {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
        ],
    )
    content = response.choices[0].message.content or "{}"
    return GeneratedChallenge.model_validate_json(content)


def calculate_readiness(challenge: GeneratedChallenge, answered_count: int, question_count: int) -> int:
    completed_fields = sum(bool(value) for value in [challenge.title, challenge.problem, challenge.goal, challenge.target_users, challenge.expected_result, challenge.success_metrics, challenge.constraints])
    field_score = round(completed_fields / 7 * 70)
    answer_score = round(answered_count / max(question_count, 1) * 30)
    return min(100, field_score + answer_score)
