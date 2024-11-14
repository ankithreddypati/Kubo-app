# Use Python 3.9 as base
FROM registry.access.redhat.com/ubi8/python-39

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install system dependencies and Python packages
USER root
RUN dnf install -y gcc python39-devel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code and model
COPY src/ /app/src/
COPY models/lipsync/model/ /app/model/

# Switch back to non-root user
USER 1001

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "src.inference:app", "--host", "0.0.0.0", "--port", "8000"]