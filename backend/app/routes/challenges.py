from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..ai import calculate_readiness, generate_challenge
from ..auth import require_role
from ..database import get_db
from ..models import Challenge, ClarificationQuestion, User
from ..schemas import ChallengeAnswers, ChallengeCreate, ChallengeResponse

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


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = Challenge(owner_id=current_user.id, raw_description=payload.description, readiness_score=0)
    challenge.questions = [ClarificationQuestion(question=question) for question in [
        "Who is most affected by this problem?",
        "How is this problem currently handled?",
        "What measurable result would make this project successful?",
        "What constraints should student teams know about?",
    ]]
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
    answers = {str(question.id): question.answer or "" for question in challenge.questions}
    generated = generate_challenge(challenge.raw_description, answers)
    for field in generated.model_fields:
        setattr(challenge, field, getattr(generated, field))
    answered_count = sum(bool(question.answer) for question in challenge.questions)
    challenge.readiness_score = calculate_readiness(generated, answered_count, len(challenge.questions))
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
