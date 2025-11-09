# HUMMBL Development Container

This directory contains the configuration for a complete HUMMBL development environment using VS Code Dev Containers.

## 🚀 Quick Start

1. **Prerequisites**:
   - Docker Desktop installed and running
   - VS Code with the "Dev Containers" extension

2. **Launch the environment**:
   ```bash
   # From the repository root
   code .
   ```

3. **When prompted in VS Code**:
   - Click "Reopen in Container" or
   - Use Command Palette: `Dev Containers: Reopen in Container`

4. **Wait for setup** (~90 seconds first time, cached afterwards)

## 🏗️ What's Included

### Development Tools
- **Node.js 20** with TypeScript support
- **pnpm** for package management
- **Docker-in-Docker** for containerized workflows
- **GitHub CLI** for repository management
- **Git** with optimized configuration

### VS Code Extensions
- TypeScript Next
- Tailwind CSS IntelliSense
- Prettier (code formatting)
- ESLint (code linting)
- GitHub Copilot & Copilot Chat
- Remote Containers support

### System Resources
- **4 CPU cores** allocated
- **8GB RAM** allocated
- **128-core equivalent** cloud environment when using GitHub Codespaces

### Port Forwarding
- `3000` - Main development server
- `5173` - Vite dev server
- `8080` - Additional services
- `4000` - API/Backend services
- `5432` - PostgreSQL (if enabled)
- `6379` - Redis (if enabled)

## 🔧 Configuration Files

- **`devcontainer.json`** - Main container configuration
- **`Dockerfile`** - Custom container image
- **`docker-compose.yml`** - Multi-service orchestration
- **`setup.sh`** - Post-creation setup script

## 🛠️ Development Workflow

1. **Start development**:
   ```bash
   pnpm install
   pnpm dev
   ```

2. **Run tests**:
   ```bash
   pnpm test
   ```

3. **Build for production**:
   ```bash
   pnpm build
   ```

## 🐳 Manual Docker Usage

If you prefer to use Docker directly:

```bash
# Build the development image
docker-compose -f .devcontainer/docker-compose.yml build

# Start the development environment
docker-compose -f .devcontainer/docker-compose.yml up -d

# Access the container
docker-compose -f .devcontainer/docker-compose.yml exec hummbl-dev bash
```

## 🔄 Rebuilding the Container

If you need to rebuild the container (after changing configuration):

1. **Command Palette** → `Dev Containers: Rebuild Container`
2. Or manually:
   ```bash
   docker-compose -f .devcontainer/docker-compose.yml down
   docker-compose -f .devcontainer/docker-compose.yml build --no-cache
   ```

## 📋 Environment Variables

The container sets up these environment variables:
- `NODE_ENV=development`
- `HUMMBL_ENV=development`
- `TZ=UTC`

## 🚨 Troubleshooting

### Container won't start
- Ensure Docker Desktop is running
- Check available system resources (8GB RAM required)
- Try rebuilding: `Dev Containers: Rebuild Container`

### Port conflicts
- Modify port mappings in `devcontainer.json`
- Check for existing services on conflicted ports

### Permission issues
- The container runs as `node` user
- Files are mounted with cached consistency for performance

## 🎯 Performance Notes

- **First launch**: ~90 seconds (downloads and builds)
- **Subsequent launches**: ~10-15 seconds (cached)
- **Hot reload**: Enabled for all supported file types
- **Volume caching**: Optimized for macOS/Windows performance

## 🔗 External Services

Optional services available via docker-compose:
- **PostgreSQL 15** - Database
- **Redis 7** - Caching and session storage

Enable by uncommenting in `docker-compose.yml`.

---

**Happy coding! 🚀**

For issues or improvements, please open an issue in the HUMMBL repository.