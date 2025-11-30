FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# - build-essential: for compiling Python packages
# - libgl1, libglib2.0-0: for OpenCV if needed
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
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install core requirements (all available on PyPI)
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    torch>=2.1.0,<2.4.0 \
    torchvision>=0.16.0,<0.19.0 \
    torchaudio>=2.1.0,<2.4.0 \
    transformers>=4.35.0,<5.0.0 \
    sentence-transformers>=2.2.2,<3.0.0 \
    numpy \
    scipy \
    scikit-learn \
    pandas \
    requests \
    beautifulsoup4 \
    arxiv \
    neurokit2 \
    brian2 \
    mediapipe \
    opencv-python-headless \
    websockets \
    pyyaml \
    python-multipart \
    python-jose[cryptography] \
    passlib[bcrypt] \
    pyasn1>=0.5.0 \
    pyasn1-modules>=0.3.0 \
    dimod \
    pennylane \
    qiskit \
    qiskit-algorithms \
    qiskit-optimization \
    qiskit-aer \
    networkx \
    swarms>=2.0.0 \
    psycopg2-binary \
    PyPDF2 \
    python-docx \
    httpx>=0.24.0 \
    orjson>=3.9.0 \
    swarm-shield>=0.0.1 \
    exa-py>=1.0.0 \
    llama-index>=0.10.0 \
    llama-index-core>=0.10.0 \
    chromadb>=0.4.0 \
    swarms-tools>=0.3.0 \
    supabase

# Install Swarm Corporation components from source
# These enhance functionality but are optional - app works without them
RUN set -e; \
    for repo in \
        "doc-master" \
        "omniparse" \
        "agentparse" \
        "research-paper-hive" \
        "advanced-research" \
        "agent-rag-protocol" \
        "multi-agent-rag-template" \
        "zero" \
        "swarms-utils" \
        "swarms-memory"; \
    do \
        echo "Installing $repo..."; \
        pip install --no-cache-dir "git+https://github.com/The-Swarm-Corporation/${repo}.git" || \
        echo "Warning: Failed to install $repo (optional component)"; \
    done

# Create necessary directories for agent workspaces, data, and ChromaDB
RUN mkdir -p /app/agent_workspace /app/data /app/workspace/agents /app/workspace/swarms /app/data/chromadb

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
