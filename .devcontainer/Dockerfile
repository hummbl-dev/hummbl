# Use the official Node.js image with TypeScript support
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Set the working directory
WORKDIR /workspace

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    htop \
    tree \
    jq \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install global development tools
RUN npm install -g \
    typescript \
    @types/node \
    ts-node \
    nodemon \
    concurrently \
    vite

# Install Docker CLI
RUN curl -fsSL https://get.docker.com | sh

# Set up user permissions
RUN usermod -aG docker node

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f "pnpm-lock.yaml" ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# Create workspace directory
RUN mkdir -p /workspace && chown -R node:node /workspace

# Switch to node user
USER node

# Set up git configuration
RUN git config --global init.defaultBranch main
RUN git config --global pull.rebase false

# Expose common development ports
EXPOSE 3000 5173 8080 4000

# Default command
CMD ["sleep", "infinity"]