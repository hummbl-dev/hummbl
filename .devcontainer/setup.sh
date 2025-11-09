#!/bin/bash

# HUMMBL Development Environment Setup Script
echo "🚀 Setting up HUMMBL development environment..."

# Update package manager
sudo apt-get update

# Install additional development tools
sudo apt-get install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  tree \
  jq \
  build-essential

# Install pnpm (preferred package manager for HUMMBL)
npm install -g pnpm@latest

# Install global development utilities
npm install -g \
  typescript \
  @types/node \
  ts-node \
  nodemon \
  concurrently

# Set up git configuration helpers
git config --global init.defaultBranch main
git config --global pull.rebase false

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
  echo "📦 Installing project dependencies with pnpm..."
  pnpm install
fi

# Set up environment variables
echo "export HUMMBL_ENV=development" >> ~/.bashrc
echo "export NODE_ENV=development" >> ~/.bashrc

# Install zsh and oh-my-zsh for better terminal experience
sudo apt-get install -y zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

echo "✅ HUMMBL development environment setup complete!"
echo "🔄 Restart your terminal or source ~/.bashrc to apply changes"