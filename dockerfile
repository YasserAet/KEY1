FROM node:16

WORKDIR /app

# Install build essentials
RUN apt-get update && apt-get install -y build-essential python3

# Copy package files first (for better caching)
COPY package*.json ./

# Add memory limit for npm install
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies with more detailed logging
RUN npm i --verbose --no-fund --no-audit

# Then copy the rest of the app
COPY . .