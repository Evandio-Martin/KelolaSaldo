FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Create non-root user for Hugging Face
RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user
ENV PATH=/home/user/.local/bin:$PATH

# Hugging Face uses port 7860
EXPOSE 7860

CMD ["gunicorn", "capstone.wsgi:application", "--bind", "0.0.0.0:7860", "--workers", "2", "--timeout", "120", "--keep-alive", "5"]