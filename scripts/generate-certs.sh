#!/bin/bash

# Create certificates directory
mkdir -p certificates

# Generate a private key and self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certificates/localhost.key -out certificates/localhost.crt \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Certificates generated in ./certificates/"
echo "You can now run the application with Docker Compose"