#!/bin/sh
set -eu

psql --set=ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=content_password="$CONTENT_DATABASE_PASSWORD" \
  --set=assessment_password="$ASSESSMENT_DATABASE_PASSWORD" \
  --set=migration_password="$MIGRATION_DATABASE_PASSWORD" <<'SQL'
CREATE ROLE content_migrator LOGIN PASSWORD :'migration_password';
CREATE ROLE content LOGIN PASSWORD :'content_password';
CREATE ROLE assessment_migrator LOGIN PASSWORD :'migration_password';
CREATE ROLE assessment LOGIN PASSWORD :'assessment_password';
GRANT CONNECT ON DATABASE transformation TO content_migrator, content, assessment_migrator, assessment;
CREATE SCHEMA IF NOT EXISTS content AUTHORIZATION content_migrator;
CREATE SCHEMA IF NOT EXISTS assessment AUTHORIZATION assessment_migrator;
GRANT USAGE ON SCHEMA content TO content;
GRANT USAGE ON SCHEMA assessment TO assessment;
ALTER DEFAULT PRIVILEGES FOR ROLE content_migrator IN SCHEMA content GRANT SELECT, INSERT ON TABLES TO content;
ALTER DEFAULT PRIVILEGES FOR ROLE assessment_migrator IN SCHEMA assessment GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO assessment;
SQL

# The entrypoint briefly starts PostgreSQL while running init scripts. This
# marker prevents dependent migration jobs from mistaking that temporary
# server for the fully initialized database.
touch /var/lib/postgresql/data/.platform-lab-initialized
