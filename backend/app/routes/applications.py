from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import require_role
from ..database import get_db
from ..models import Application, Challenge, User
from ..schemas import ApplicationCreate, ApplicationResponse

router = APIRouter(prefix="/api/challenges/{challenge_id}/applications", tags=["applications"])
selection_router = APIRouter(prefix="/api/applications", tags=["applications"])


def ensure_challenge(challenge_id: int, db: Session) -> Challenge:
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    challenge_id: int,
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    challenge = ensure_challenge(challenge_id, db)
    if challenge.status != "published":
        raise HTTPException(status_code=409, detail="Applications are only open for published challenges")
    existing = db.scalar(
        select(Application).where(
            Application.challenge_id == challenge_id,
            Application.student_id == current_user.id,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="You have already applied to this challenge")
    application = Application(challenge_id=challenge_id, student_id=current_user.id, **payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("", response_model=list[ApplicationResponse])
def list_applications(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    challenge = ensure_challenge(challenge_id, db)
    if challenge.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this challenge")
    return db.scalars(select(Application).where(Application.challenge_id == challenge_id).order_by(Application.created_at.desc())).all()


@selection_router.post("/{application_id}/select", response_model=ApplicationResponse)
def select_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("business")),
):
    application = db.get(Application, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    challenge = ensure_challenge(application.challenge_id, db)
    if challenge.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this challenge")
    applications = db.scalars(select(Application).where(Application.challenge_id == challenge.id)).all()
    for item in applications:
        item.status = "selected" if item.id == application.id else "rejected"

    db.commit()
    db.refresh(application)
    return application
