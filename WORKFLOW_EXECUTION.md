# Workflow Execution Engine

**Status**: ✅ IMPLEMENTED (Client-Side)  
**Date**: 2025-11-08  
**Version**: 1.0.0

---

## What We Built

A complete **client-side workflow execution engine** that makes workflows actually run with AI agents.

### Components

#### 1. **AI Service Layer** (`src/services/ai.ts`)
- Integrates with Claude (Anthropic) and GPT (OpenAI)
- Configurable API keys
- Temperature and token control
- Error handling

#### 2. **Task Executor** (`src/services/taskExecutor.ts`)
- Executes individual tasks with assigned agents
- Dependency checking
- Context passing between tasks
- Retry logic
- AI prompt building

#### 3. **Workflow Runner** (`src/services/workflowRunner.ts`)
- Orchestrates full workflow execution
- Parallel task execution where possible
- Dependency resolution
- Progress tracking
- Pause/resume support

#### 4. **Settings Page** (`src/pages/Settings.tsx`)
- Configure API keys for Anthropic/OpenAI
- Secure key storage (localStorage)
- User-friendly interface

---

## How It Works

### Execution Flow

```
1. User creates workflow with tasks and agents
2. User configures API keys in Settings
3. User runs workflow
4. Workflow Runner:
   - Identifies tasks ready to run (dependencies met)
   - Executes ready tasks in parallel
   - Each task:
     a. Gets assigned agent
     b. Builds AI prompt with context
     c. Calls AI provider
     d. Returns structured output
   - Passes task outputs to dependent tasks
   - Continues until all tasks complete
5. Shows results and progress to user
```

### Dependency Resolution

Tasks execute in order based on dependencies:
- Tasks with no dependencies run first
- Tasks wait for their dependencies to complete
- Multiple independent tasks run in parallel
- Failed tasks can retry up to maxRetries

### AI Integration

Each agent has:
- **Model**: claude-3-sonnet, gpt-4, etc.
- **Role**: researcher, analyst, executor, reviewer
- **Capabilities**: List of what agent can do
- **Temperature**: Controls creativity (0-1)

Tasks prompt agents with:
- Agent role and capabilities
- Task description
- Previous task outputs (dependencies)
- Task input data

---

## Usage

### 1. Configure API Keys

Navigate to **Settings** and add:
- **Anthropic API Key** for Claude models
- **OpenAI API Key** for GPT models

Keys are stored locally in browser.

### 2. Create Workflow

1. Go to **Workflows** → **Create Workflow**
2. Add agents with models (claude-3-sonnet, gpt-4, etc.)
3. Add tasks and assign agents
4. Set task dependencies
5. Configure task inputs
6. Save workflow

### 3. Run Workflow

1. Open workflow
2. Click **Run Workflow**
3. Watch real-time progress
4. See task results as they complete
5. View final outputs

---

## Next Steps

### To Make This Production-Ready

**Phase 1: Current (Client-Side)**
- ✅ AI service integration
- ✅ Task execution
- ✅ Workflow orchestration
- ✅ Settings page
- ⏳ Update WorkflowDetail to show execution
- ⏳ Add "Run" button to workflows
- ⏳ Show live progress and results

**Phase 2: Backend (Cloudflare Workers)**
- Move execution to Cloudflare Workers
- Use D1 for workflow/result storage
- Use Queue for task orchestration
- WebSocket for real-time updates
- Better error handling and logging

**Phase 3: Advanced Features**
- Workflow scheduling (cron)
- Webhook triggers
- Team collaboration
- Workflow versioning
- Result history
- Cost tracking

---

## File Structure

```
src/
├── services/
│   ├── ai.ts              # AI provider integrations
│   ├── taskExecutor.ts    # Task execution logic
│   └── workflowRunner.ts  # Workflow orchestration
├── pages/
│   └── Settings.tsx       # API key configuration
└── vite-env.d.ts         # TypeScript env definitions
```

---

## API Keys

### Anthropic (Claude)

Get your API key from: https://console.anthropic.com/

Supported models:
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

### OpenAI (GPT)

Get your API key from: https://platform.openai.com/api-keys

Supported models:
- `gpt-4`
- `gpt-4-turbo-preview`
- `gpt-3.5-turbo`

---

## Security

**Client-Side Storage:**
- API keys stored in browser localStorage
- Keys never sent to HUMMBL servers
- Keys only used for direct API calls to providers
- Clear localStorage to remove keys

**Best Practices:**
- Don't share API keys
- Use environment variables in production
- Monitor API usage on provider dashboards
- Set usage limits on provider accounts

---

## Example Workflow

**Research & Analysis Pipeline:**

1. **Research Agent** (Claude Sonnet)
   - Task: "Gather information about topic X"
   - Output: Research findings

2. **Analysis Agent** (Claude Sonnet)
   - Task: "Analyze findings from research"
   - Dependencies: Task 1
   - Input: Research findings
   - Output: Analysis report

3. **Report Generator** (GPT-4)
   - Task: "Create final report"
   - Dependencies: Task 2
   - Input: Analysis report
   - Output: Formatted report

All three agents work together automatically!

---

## Troubleshooting

### "API key not configured"
→ Go to Settings and add your API key

### "Agent model not configured"
→ Edit agent and select a model (claude-3-sonnet, etc.)

### "Dependencies not satisfied"
→ Check task dependencies are correct
→ Ensure no circular dependencies

### "Task failed"
→ Check AI response in task result
→ May need to adjust prompt or retry

---

## Testing

Test the execution engine:

1. Go to Settings → Add API keys
2. Go to Templates → Use "Research & Analysis Pipeline"
3. Click Run on the workflow
4. Watch tasks execute
5. View results

---

**Next**: Update WorkflowDetail page to integrate the runner and show live execution!

