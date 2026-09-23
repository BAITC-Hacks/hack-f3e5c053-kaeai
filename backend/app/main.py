from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import get_settings
from .database import Base, engine
from .routes import applications, auth, challenges

print('')
@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE applications ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'"))
        connection.execute(text("ALTER TABLE challenges ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL"))
        connection.execute(text("ALTER TABLE applications ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES users(id) ON DELETE SET NULL"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_challenges_owner_id ON challenges(owner_id)"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS ix_applications_student_id ON applications(student_id)"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_application_challenge_student ON applications(challenge_id, student_id) WHERE student_id IS NOT NULL"))
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(challenges.router)
app.include_router(applications.router)
app.include_router(applications.selection_router)
app.include_router(auth.router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
