# HUMMBL - Highly Useful Mental Model Base Language

A comprehensive dashboard for managing agentic workflows with AI-powered agents, built with React, TypeScript, and modern web technologies.

> **🚧 Preview Build Notice**
> 
> This is a **preview demonstration** of the HUMMBL interface and design system. The current deployment showcases:
> - ✅ Full UI/UX design and navigation
> - ✅ Workflow creation and editing interfaces (localStorage-based)
> - ✅ 120+ mental model framework database
> - ✅ Agent configuration and template system
> - ⏳ Workflow execution (coming in production release)
> - ⏳ Backend data persistence (coming in production release)
> - ⏳ Team collaboration features (coming in production release)
>
> **Try it now**: [https://hummbl.vercel.app](https://hummbl.vercel.app)

## Overview

HUMMBL is an intuitive workflow management system that allows you to create, configure, and monitor complex agentic workflows. Each workflow can contain multiple AI agents with specific roles and capabilities working together to accomplish tasks.

## Features

- **Authentication**: Secure sign in/sign up with session management and JWT tokens
- **Workflow Management**: Create, edit, delete, and monitor workflows
- **Agent Configuration**: Configure AI agents with specific roles, capabilities, and models
- **Task Orchestration**: Define tasks with dependencies and execution flow
- **Real-time Monitoring**: Track workflow execution with live status updates
- **Template System**: Start quickly with pre-configured workflow templates
- **Execution Logs**: Monitor detailed logs of workflow execution
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Utilities**: date-fns

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **API Documentation**: OpenAPI 3.0 + Swagger UI

## Quick Links

- **Live App**: [https://hummbl.vercel.app](https://hummbl.vercel.app)
- **Backend API**: [https://hummbl-backend.hummbl.workers.dev](https://hummbl-backend.hummbl.workers.dev)
- **API Documentation**: [https://hummbl-backend.hummbl.workers.dev/api/docs](https://hummbl-backend.hummbl.workers.dev/api/docs) (Swagger UI)
- **OpenAPI Spec**: [View YAML](https://hummbl-backend.hummbl.workers.dev/api/docs/openapi.yaml)

## Documentation

- **Authentication Guide**: See `AUTHENTICATION_GUIDE.md` for sign in/sign up implementation
- **API Documentation**: See `workers/API_DOCUMENTATION.md` for complete API reference
- **Testing Guide**: See `TESTING_AGENTS.md` for production testing
- **Workflow Guide**: See `WORKFLOW_USAGE_GUIDE.md` for workflow concepts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hummbl
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
hummbl/
├── src/
│   ├── components/
│   │   └── Layout/           # Layout components (Header, Sidebar)
│   ├── data/
│   │   └── templates.ts      # Workflow templates
│   ├── pages/
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── WorkflowList.tsx  # Workflow listing
│   │   ├── WorkflowDetail.tsx # Workflow details and monitoring
│   │   ├── WorkflowEditor.tsx # Create/edit workflows
│   │   ├── AgentManagement.tsx # Agent configuration
│   │   └── Templates.tsx     # Template browser
│   ├── store/
│   │   └── workflowStore.ts  # Zustand state management
│   ├── types/
│   │   └── workflow.ts       # TypeScript type definitions
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── index.html                # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Usage Guide

### Creating a Workflow

1. Navigate to the **Workflows** page
2. Click **New Workflow**
3. Enter workflow details (name, description, tags)
4. Save the workflow

### Managing Agents

1. Go to the **Agents** page
2. Click **New Agent**
3. Configure agent properties:
   - Name and role
   - Description
   - Capabilities
   - Model settings (model, temperature, max tokens)
4. Save the agent

### Using Templates

1. Visit the **Templates** page
2. Browse available templates by category
3. Click **Use This Template**
4. Enter a name for your new workflow
5. The workflow will be created with pre-configured agents and tasks

### Monitoring Workflows

1. Click on a workflow from the **Workflows** page
2. View workflow status, progress, and tasks
3. Start, pause, or stop workflow execution
4. Monitor execution logs in real-time

## Workflow Concepts

### Workflows

A workflow is a collection of tasks executed by agents to achieve a specific goal. Each workflow has:
- **Status**: draft, active, paused, completed, or failed
- **Tasks**: Individual units of work
- **Agents**: AI agents that execute tasks
- **Metadata**: Tags, timestamps, and custom data

### Agents

Agents are AI-powered entities that perform tasks. Each agent has:
- **Role**: researcher, analyst, executor, reviewer, or custom
- **Capabilities**: List of what the agent can do
- **Model Configuration**: AI model, temperature, and token limits

### Tasks

Tasks are individual steps in a workflow. Each task includes:
- **Dependencies**: Other tasks that must complete first
- **Agent Assignment**: Which agent executes the task
- **Status Tracking**: pending, running, completed, failed, or skipped
- **Retry Logic**: Automatic retry on failure

### Templates

Pre-configured workflows with agents and tasks ready to use:
- **Research & Analysis Pipeline**: Multi-stage research workflow
- **Content Creation Workflow**: Writing, editing, and SEO optimization
- **Data Processing Pipeline**: ETL workflow with validation
- **Automated Code Review**: Multi-agent code quality analysis

## API / State Management

The application uses Zustand for state management. Key store methods:

### Workflow Operations
- `addWorkflow(workflow)`: Create new workflow
- `updateWorkflow(id, updates)`: Update existing workflow
- `deleteWorkflow(id)`: Delete workflow
- `getWorkflow(id)`: Retrieve workflow by ID

### Agent Operations
- `addAgent(agent)`: Create new agent
- `updateAgent(id, updates)`: Update agent
- `deleteAgent(id)`: Delete agent
- `getAgent(id)`: Retrieve agent by ID

### Execution Operations
- `startWorkflow(id)`: Start workflow execution
- `pauseWorkflow(id)`: Pause workflow
- `stopWorkflow(id)`: Stop workflow

### Log Operations
- `addLog(log)`: Add execution log
- `getWorkflowLogs(workflowId)`: Get logs for workflow

## Customization

### Adding New Templates

Edit `src/data/templates.ts` to add custom workflow templates:

```typescript
{
  id: 'my-template',
  name: 'My Custom Template',
  description: 'Template description',
  category: 'Custom',
  tags: ['tag1', 'tag2'],
  agents: [/* agent configs */],
  tasks: [/* task configs */]
}
```

### Styling

The application uses Tailwind CSS. Custom styles are defined in:
- `src/index.css`: Global styles and custom components
- `tailwind.config.js`: Theme configuration

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

- **CI** (`ci.yml`): Runs on all pushes and PRs, tests across Node.js 18, 20, and 22
- **Azure Deploy** (`azure-deploy.yml`): Deploys to Azure Web Apps on main branch updates

### Fixing Old Workflow Failures

If you see failing workflows for Grunt or other legacy build systems:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Actions** → **General**
3. Scroll to **Workflow permissions** and disable unwanted workflows
4. Or go to **Actions** tab, select the failing workflow, and disable it

The proper workflows are now configured in `.github/workflows/` for the Vite build system.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository.
