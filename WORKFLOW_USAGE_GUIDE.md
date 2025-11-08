# Workflow Execution - Usage Guide

**Status**: ✅ READY TO TEST  
**Date**: 2025-11-08

---

## Quick Start

### 1. Configure API Keys

Navigate to **Settings** page:

1. Click "Settings" in the sidebar
2. Add your API keys:
   - **Anthropic API Key**: For Claude models (get from console.anthropic.com)
   - **OpenAI API Key**: For GPT models (get from platform.openai.com/api-keys)
3. Click "Save Settings"

Keys are stored locally in your browser and never sent to HUMMBL servers.

---

### 2. Create or Use a Workflow

**Option A: Use a Template**
1. Go to **Templates**
2. Click on a template (e.g., "Research & Analysis Pipeline")
3. Click "Use Template"
4. Workflow is created automatically

**Option B: Create from Scratch**
1. Go to **Workflows**
2. Click "New Workflow"
3. Add agents with models (claude-3-sonnet, gpt-4, etc.)
4. Add tasks and assign to agents
5. Set task dependencies
6. Save workflow

---

### 3. Run the Workflow

1. Open the workflow
2. Click **"Run Workflow"** button
3. Watch real-time progress:
   - Status updates live
   - Progress bar shows completion
   - Tasks show running/completed/failed states
4. View results when complete

---

## Execution Features

### Real-Time Updates

- **Progress Bar**: Shows overall completion percentage
- **Task Status Icons**:
  - ⏳ Gray circle: Pending
  - 🔵 Blue spinner: Running
  - ✅ Green check: Completed
  - ❌ Red X: Failed
- **Live Task Results**: See AI responses as tasks complete

### Task Results Display

When a task completes, you'll see:
- ✅ Green result box with AI output
- ⏱️ Execution duration
- 📊 Structured data (JSON) or plain text

When a task fails, you'll see:
- ❌ Red error box with error message
- 🔄 Retry information

### Dependencies

Tasks execute in the correct order:
- Tasks with no dependencies run immediately
- Tasks wait for dependencies to complete
- Multiple independent tasks run in parallel
- Failed dependencies block dependent tasks

---

## Example Workflow

### Research & Analysis Pipeline

**Agents:**
1. **Research Agent** (Claude Sonnet)
   - Role: researcher
   - Model: claude-3-sonnet-20240229

2. **Analysis Agent** (Claude Sonnet)
   - Role: analyst
   - Model: claude-3-sonnet-20240229

3. **Report Generator** (GPT-4)
   - Role: writer
   - Model: gpt-4

**Tasks:**

**Task 1: Gather Information**
- Agent: Research Agent
- Description: Research and gather information about the topic
- Dependencies: None
- Runs: First

**Task 2: Analyze Findings**
- Agent: Analysis Agent
- Description: Analyze the research findings
- Dependencies: Task 1
- Runs: After Task 1 completes

**Task 3: Generate Report**
- Agent: Report Generator
- Description: Create final formatted report
- Dependencies: Task 2
- Runs: After Task 2 completes

**Execution Flow:**
```
Task 1 (Research) → completes → outputs findings
  ↓
Task 2 (Analysis) → receives findings → completes → outputs analysis
  ↓
Task 3 (Report) → receives analysis → completes → outputs final report
```

---

## Troubleshooting

### "API key not configured"

**Problem**: No API key set for the agent's model
**Solution**:
1. Go to Settings
2. Add the appropriate API key (Anthropic for Claude, OpenAI for GPT)
3. Save settings
4. Try running workflow again

### "Agent model not configured"

**Problem**: Agent doesn't have a model assigned
**Solution**:
1. Edit the workflow
2. Edit the agent
3. Select a model from dropdown
4. Save changes

### Task Fails with Error

**Problem**: Task execution failed
**Solutions**:
- Check the error message in red box
- Verify API key is correct
- Check if you have API credits
- Simplify the task prompt
- Try running again (retry logic included)

### Tasks Stuck Pending

**Problem**: Tasks not executing
**Possible Causes**:
- Circular dependencies
- Missing API keys
- Workflow not actually running

**Solution**:
- Check task dependencies for loops
- Verify all agents have models
- Click "Run Workflow" button

---

## Best Practices

### 1. Start Simple

Begin with 2-3 tasks before building complex workflows.

### 2. Use Clear Task Descriptions

The AI uses your task description as context. Be specific:
- ✅ "Analyze the sales data for trends and patterns"
- ❌ "Do analysis"

### 3. Set Meaningful Dependencies

Only add dependencies when tasks truly need previous outputs:
- ✅ Analysis task depends on research task
- ❌ Independent tasks shouldn't have dependencies

### 4. Choose Appropriate Models

- **Claude Sonnet**: Best for reasoning, analysis, research
- **Claude Haiku**: Fast, simple tasks
- **GPT-4**: Strong at creative writing, code
- **GPT-3.5**: Quick, less complex tasks

### 5. Monitor Costs

Each task calls an AI API which costs money:
- Claude Sonnet: ~$0.003 per task (varies by length)
- GPT-4: ~$0.03 per task (varies by length)
- Monitor usage in provider dashboards

---

## Advanced Features

### Task Context Passing

Tasks automatically receive outputs from their dependencies:

```typescript
// Task 1 outputs: { findings: "..." }
// Task 2 automatically receives this in its context
// AI prompt for Task 2 includes Task 1's output
```

### Retry Logic

Failed tasks automatically retry based on `maxRetries` setting.

### Temperature Control

Adjust agent creativity:
- 0.0-0.3: Deterministic, factual
- 0.4-0.7: Balanced (default)
- 0.8-1.0: Creative, varied

---

## What's Next

### Current Limitations

- Client-side execution only (browser tab must stay open)
- No workflow scheduling
- No result history
- No team collaboration

### Coming in Phase 2

- ☐ Backend execution (Cloudflare Workers)
- ☐ Background processing
- ☐ Workflow scheduling (cron)
- ☐ Webhook triggers
- ☐ Result history and versioning
- ☐ Team workspaces
- ☐ Cost tracking
- ☐ Workflow templates marketplace

---

## Testing Checklist

Before your first workflow run:

- [ ] API keys configured in Settings
- [ ] Workflow has at least one agent with model
- [ ] All tasks assigned to agents
- [ ] Task dependencies are correct (no loops)
- [ ] Browser tab will stay open during execution
- [ ] You have API credits with provider

---

## Need Help?

### Check These First

1. **Settings page**: Verify API keys are saved
2. **Agent page**: Confirm agents have models assigned
3. **Workflow editor**: Check task dependencies
4. **Browser console**: Look for error messages (F12)

### Common Issues

**Workflow doesn't start:**
- Check if you clicked "Run Workflow"
- Verify at least one task has no dependencies

**All tasks fail:**
- Likely API key issue
- Go to Settings and re-enter keys

**Some tasks fail:**
- Check error message on failed task
- May be prompt issue or model limitations

---

## Success!

When everything works:
1. ✅ Tasks turn green with results
2. ✅ Progress bar reaches 100%
3. ✅ You can view all task outputs
4. ✅ Ready to run again or create new workflows

**Happy automating with HUMMBL! 🚀**

