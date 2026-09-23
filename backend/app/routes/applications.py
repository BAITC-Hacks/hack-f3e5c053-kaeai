from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application, Challenge
from ..schemas import ApplicationCreate, ApplicationResponse

router = APIRouter(prefix="/api/challenges/{challenge_id}/applications", tags=["applications"])


def ensure_challenge(challenge_id: int, db: Session) -> Challenge:
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(challenge_id: int, payload: ApplicationCreate, db: Session = Depends(get_db)):
    challenge = ensure_challenge(challenge_id, db)
    if challenge.status != "published":
        raise HTTPException(status_code=409, detail="Applications are only open for published challenges")
    application = Application(challenge_id=challenge_id, **payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("", response_model=list[ApplicationResponse])
def list_applications(challenge_id: int, db: Session = Depends(get_db)):
    ensure_challenge(challenge_id, db)
    return db.scalars(select(Application).where(Application.challenge_id == challenge_id).order_by(Application.created_at.desc())).all()
