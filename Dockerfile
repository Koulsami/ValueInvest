# n8n Docker image for Value Investing Pipeline
FROM n8nio/n8n:latest

# Set working directory
WORKDIR /home/node

# Copy workflow files to import location
COPY workflows/*.json /home/node/.n8n/

# Expose n8n port
EXPOSE 5678

# Start n8n
CMD ["n8n", "start"]
