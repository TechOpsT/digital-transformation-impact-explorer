"""create content definitions"""
from alembic import op
import sqlalchemy as sa

revision = "0001_content"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("definitions", sa.Column("kind", sa.String(40), primary_key=True), sa.Column("version", sa.String(80), primary_key=True), sa.Column("document", sa.JSON(), nullable=False), schema="content")

def downgrade():
    op.drop_table("definitions", schema="content")
