FROM python:3.11-slim

# Create the working directory
WORKDIR /app

# --- FIX: Create writable data directory ---
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Install backend dependencies
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy full backend code
COPY . /app

# Environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["python", "app.py"]
