FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only what is needed
COPY AuthApp.py .

ENV PYTHONUNBUFFERED=1

CMD ["python", "AuthApp.py"]
