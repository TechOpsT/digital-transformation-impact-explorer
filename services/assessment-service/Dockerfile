FROM python:3.13.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
RUN groupadd --system --gid 10001 app && useradd --system --uid 10001 --gid app --home /app app
WORKDIR /app
COPY services/assessment-service/requirements.lock /tmp/requirements.txt
RUN pip install --requirement /tmp/requirements.txt
COPY services/common /app/services/common
COPY services/assessment-service /app/service
ENV PYTHONPATH=/app:/app/service SERVICE_NAME=assessment-service
WORKDIR /app/service
USER 10001:10001
EXPOSE 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--no-access-log"]

FROM runtime AS test
USER root
RUN pip install pytest==9.1.1 httpx2==2.12.0
USER 10001:10001
CMD ["pytest", "-q", "-p", "no:cacheprovider"]
