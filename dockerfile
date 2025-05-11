FROM node:16

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Add memory limit for npm install
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies with verbose logging
RUN npm i --verbose

# Then copy the rest of the app
COPY . .
