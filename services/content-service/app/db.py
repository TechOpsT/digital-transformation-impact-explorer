from sqlalchemy import JSON, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from .settings import settings


class Base(DeclarativeBase):
    pass


class Definition(Base):
    __tablename__ = "definitions"
    __table_args__ = {"schema": "content"}
    kind: Mapped[str] = mapped_column(String(40), primary_key=True)
    version: Mapped[str] = mapped_column(String(80), primary_key=True)
    document: Mapped[dict] = mapped_column(JSON, nullable=False)


engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
