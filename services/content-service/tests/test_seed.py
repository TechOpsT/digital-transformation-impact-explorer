import pytest
from app.seed import definition_action


def test_seed_is_idempotent_for_identical_published_definition():
    document = {"version": "content-1.0.0", "dimensions": []}
    assert definition_action(None, document) == "insert"
    assert definition_action(document, document) == "unchanged"


def test_seed_rejects_rewriting_published_version():
    existing = {"version": "content-1.0.0", "dimensions": []}
    changed = {"version": "content-1.0.0", "dimensions": [{"id": "changed"}]}
    with pytest.raises(RuntimeError, match="differs"):
        definition_action(existing, changed)
