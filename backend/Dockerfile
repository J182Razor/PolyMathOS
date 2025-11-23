FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# - build-essential: for compiling Python packages
# - libgl1, libglib2.0-0: for OpenCV if needed (libgl1 replaces deprecated libgl1-mesa-glx)
# - portaudio19-dev: for PyAudio (voice features)
# - git: for installing packages from git and swarms/lemon-ai evolution
# - curl: for healthchecks
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    portaudio19-dev \
    git \
    curl \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Upgrade pip first
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create necessary directories for agent workspaces and data
RUN mkdir -p /app/agent_workspace /app/data /app/workspace/agents /app/workspace/swarms

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
