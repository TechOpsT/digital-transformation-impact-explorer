"""create assessments"""
from alembic import op
import sqlalchemy as sa
revision = "0001_assessment"
down_revision = None
branch_labels = None
depends_on = None
def upgrade():
    op.create_table("assessments", sa.Column("id", sa.String(36), primary_key=True), sa.Column("questionnaire_version", sa.String(80), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("responses", sa.JSON(), nullable=False), sa.Column("result", sa.JSON(), nullable=True), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), schema="assessment")
def downgrade():
    op.drop_table("assessments", schema="assessment")
