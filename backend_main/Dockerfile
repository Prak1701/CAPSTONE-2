FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Create data folder with write permissions
RUN mkdir -p /app/data \
    && chmod -R 777 /app/data

# Copy rest of backend
COPY . /app

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python", "app.py"]
