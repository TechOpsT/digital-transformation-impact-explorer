from datetime import UTC, datetime
from sqlalchemy import JSON, DateTime, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from .settings import settings


class Base(DeclarativeBase): pass


class Assessment(Base):
    __tablename__ = "assessments"
    __table_args__ = {"schema": "assessment"}
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    questionnaire_version: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="started")
    responses: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
