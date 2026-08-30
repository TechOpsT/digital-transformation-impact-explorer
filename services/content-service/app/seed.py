from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select

from .db import Definition, SessionLocal
from .settings import settings


FILES = {"content": "content-1.0.0.json", "questionnaire": "questionnaire-1.0.0.json"}


def definition_action(existing_document: dict | None, incoming_document: dict) -> str:
    if existing_document is None:
        return "insert"
    if existing_document != incoming_document:
        raise RuntimeError(f"published definition {incoming_document['version']} differs from the database")
    return "unchanged"


def seed() -> None:
    root = Path(settings.definitions_dir)
    with SessionLocal.begin() as session:
        for kind, filename in FILES.items():
            document = json.loads((root / filename).read_text(encoding="utf-8"))
            version = document["version"]
            existing = session.scalar(select(Definition).where(Definition.kind == kind, Definition.version == version))
            action = definition_action(existing.document if existing else None, document)
            if action == "insert":
                session.add(Definition(kind=kind, version=version, document=document))


if __name__ == "__main__":
    seed()
