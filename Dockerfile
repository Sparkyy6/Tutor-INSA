FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Create certificates directory
RUN mkdir -p /app/certificates

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Create entrypoint script with proper line endings
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'if [ ! -f /app/certificates/localhost.key ] || [ ! -f /app/certificates/localhost.crt ]; then' >> /app/docker-entrypoint.sh && \
    echo '  echo "Generating self-signed certificates..."' >> /app/docker-entrypoint.sh && \
    echo '  mkdir -p /app/certificates' >> /app/docker-entrypoint.sh && \
    echo '  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \' >> /app/docker-entrypoint.sh && \
    echo '    -keyout /app/certificates/localhost.key \' >> /app/docker-entrypoint.sh && \
    echo '    -out /app/certificates/localhost.crt \' >> /app/docker-entrypoint.sh && \
    echo '    -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"' >> /app/docker-entrypoint.sh && \
    echo '  echo "Certificates generated."' >> /app/docker-entrypoint.sh && \
    echo 'else' >> /app/docker-entrypoint.sh && \
    echo '  echo "Certificates already exist."' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Start the application' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]