# GitHub Workflows

This project uses GitHub Actions for CI/CD.

## Available Workflows

### CI (`ci.yml`)
Runs on every push and pull request to main branches:
- Tests across Node.js versions 18.x, 20.x, and 22.x
- Installs dependencies
- Runs linter (if available)
- Builds the application with Vite
- Uploads build artifacts

### Azure Deploy (`azure-deploy.yml`)
Deploys to Azure Web Apps on push to main/master:
- Builds the application
- Deploys to Azure (requires secrets configuration)

**Required Secrets for Azure Deployment:**
- `AZURE_WEBAPP_NAME`: Your Azure Web App name
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Your Azure publish profile

## Build System

This project uses **Vite** (not Grunt). Build commands:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Disabling Old Workflows

If you see failing workflows for Grunt or other build systems:
1. Go to repository Settings → Actions → Disable or delete the old workflows
2. Or rename/remove the old workflow files if they exist in `.github/workflows/`

The workflows in this directory are specifically configured for the Vite build system.
