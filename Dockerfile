# n8n Docker image for Value Investing Pipeline
FROM n8nio/n8n:latest

# Set working directory
WORKDIR /home/node

# Copy workflow files
COPY workflows/*.json /home/node/.n8n/workflows/

# Environment variables (set via Railway/Docker)
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_PORT=5678
ENV GENERIC_TIMEZONE=America/New_York
ENV N8N_PROTOCOL=https
ENV N8N_HOST=0.0.0.0
ENV EXECUTIONS_DATA_PRUNE=true
ENV EXECUTIONS_DATA_MAX_AGE=168

# Expose n8n port
EXPOSE 5678

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5678/healthz || exit 1

# Start n8n
CMD ["n8n", "start"]
