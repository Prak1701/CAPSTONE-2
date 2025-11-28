FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend
COPY . /app

# Create writable data directory
RUN mkdir -p /app/data && chmod -R 777 /app/data

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

EXPOSE 3000

CMD ["python", "app.py"]
