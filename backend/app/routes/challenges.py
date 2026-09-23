from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..ai import analyze_problem, generate_challenge, improve_challenge, regenerate_questions, review_challenge, translate_challenge
from ..auth import require_role
from ..database import get_db
from ..models import Challenge, ClarificationQuestion, User
from ..schemas import ChallengeAnswers, ChallengeCreate, ChallengeResponse, ImproveRequest, TranslateRequest

router = APIRouter(prefix="/api/challenges", tags=["challenges"])


def get_challenge(challenge_id: int, db: Session) -> Challenge:
    challenge = db.scalar(select(Challenge).options(selectinload(Challenge.questions)).where(Challenge.id == challenge_id))
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


def get_owned_challenge(challenge_id: int, owner: User, db: Session) -> Challenge:
    challenge = get_challenge(challenge_id, db)
    if challenge.owner_id != owner.id:
        raise HTTPException(status_code=403, detail="You do not own this challenge")
    return challenge


def challenge_payload(challenge: Challenge) -> dict:
    return {
        field: getattr(challenge, field)
        for field in (
            "title", "problem", "goal", "target_users", "expected_result",
            "success_metrics", "constraints", "recommended_skills",
        )
    }


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    analysis = analyze_problem(payload.description)
    challenge = Challenge(
        owner_id=current_user.id,
        raw_description=payload.description,
        readiness_score=max(0, min(100, int(analysis.get("score", 0)))),
    )
    challenge.questions = [
        ClarificationQuestion(question=question)
        for question in analysis["questions"]
        if isinstance(question, str) and question.strip()
    ]
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return get_challenge(challenge.id, db)


@router.get("", response_model=list[ChallengeResponse])
def list_challenges(status_filter: str = Query("published", alias="status"), db: Session = Depends(get_db)):
    if status_filter != "published":
        raise HTTPException(status_code=400, detail="Public catalog only supports published challenges")
    return db.scalars(
        select(Challenge).options(selectinload(Challenge.questions)).where(Challenge.status == status_filter).order_by(Challenge.created_at.desc())
    ).all()


@router.get("/mine", response_model=list[ChallengeResponse])
def list_my_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    return db.scalars(
        select(Challenge)
        .options(selectinload(Challenge.questions))
        .where(Challenge.owner_id == current_user.id)
        .order_by(Challenge.created_at.desc())
    ).all()


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def read_challenge(challenge_id: int, db: Session = Depends(get_db)):
    challenge = get_challenge(challenge_id, db)
    if challenge.status != "published":
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.post("/{challenge_id}/answers", response_model=ChallengeResponse)
def save_answers(
    challenge_id: int,
    payload: ChallengeAnswers,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = get_owned_challenge(challenge_id, current_user, db)
    questions = {question.id: question for question in challenge.questions}
    for item in payload.answers:
        if item.question_id not in questions:
            raise HTTPException(status_code=400, detail=f"Question {item.question_id} does not belong to challenge")
        questions[item.question_id].answer = item.answer
    db.commit()
    return get_challenge(challenge_id, db)


@router.post("/{challenge_id}/generate", response_model=ChallengeResponse)
def generate_structured_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = get_owned_challenge(challenge_id, current_user, db)
    answers = {question.question: question.answer or "" for question in challenge.questions}
    generated, score = generate_challenge(challenge.raw_description, answers)
    for field in generated.model_fields:
        setattr(challenge, field, getattr(generated, field))
    challenge.readiness_score = score
    challenge.status = "ready"
    db.commit()
    return get_challenge(challenge_id, db)


@router.post("/{challenge_id}/publish", response_model=ChallengeResponse)
def publish_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = get_owned_challenge(challenge_id, current_user, db)
    if challenge.status not in {"ready", "published"}:
        raise HTTPException(status_code=409, detail="Generate the challenge before publishing")
    challenge.status = "published"
    db.commit()
    return get_challenge(challenge_id, db)


@router.post("/{challenge_id}/questions/regenerate", response_model=ChallengeResponse)
def regenerate_challenge_questions(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = get_owned_challenge(challenge_id, current_user, db)
    if challenge.status != "draft" or any(question.answer for question in challenge.questions):
        raise HTTPException(status_code=409, detail="Questions can only be regenerated before answers are saved")
    questions = regenerate_questions(challenge.raw_description, [item.question for item in challenge.questions])
    challenge.questions = [ClarificationQuestion(question=question) for question in questions]
    db.commit()
    return get_challenge(challenge_id, db)


@router.post("/{challenge_id}/review")
def review_generated_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
) -> dict:
    challenge = get_owned_challenge(challenge_id, current_user, db)
    if challenge.status not in {"ready", "published"}:
        raise HTTPException(status_code=409, detail="Generate the challenge before reviewing")
    return review_challenge(challenge.raw_description, challenge_payload(challenge))


@router.post("/{challenge_id}/improve", response_model=ChallengeResponse)
def improve_generated_challenge(
    challenge_id: int,
    payload: ImproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = get_owned_challenge(challenge_id, current_user, db)
    if challenge.status != "ready":
        raise HTTPException(status_code=409, detail="Only an unpublished generated challenge can be improved")
    generated, score = improve_challenge(challenge.raw_description, challenge_payload(challenge), payload.instruction)
    for field in generated.model_fields:
        setattr(challenge, field, getattr(generated, field))
    if score:
        challenge.readiness_score = score
    db.commit()
    return get_challenge(challenge_id, db)


@router.post("/{challenge_id}/translate", response_model=ChallengeResponse)
def translate_generated_challenge(
    challenge_id: int,
    payload: TranslateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = get_owned_challenge(challenge_id, current_user, db)
    if challenge.status != "ready":
        raise HTTPException(status_code=409, detail="Only an unpublished generated challenge can be translated")
    translated = translate_challenge(challenge_payload(challenge), payload.target_language)
    for field in translated.model_fields:
        setattr(challenge, field, getattr(translated, field))
    db.commit()
    return get_challenge(challenge_id, db)
