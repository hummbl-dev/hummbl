# HUMMBL Visual Workflow Builder - Quickstart Guide
**Get your first workflow running in under 5 minutes** 🚀

---

## Welcome to HUMMBL!

The Visual Workflow Builder lets you orchestrate multi-agent AI workflows without writing code. This guide will walk you through creating your first workflow step-by-step.

---

## Your First Workflow in 5 Steps

### Step 1: Create a New Workflow (30 seconds)

1. Click the **"New Workflow"** button (blue button on dashboard)
2. Give your workflow a name: **"My First Workflow"**
3. Add a description: **"Learning the Visual Workflow Builder"**
4. *(Optional)* Add tags like `test`, `learning`

✅ **You should now see**: The Workflow Editor with a blank canvas

---

### Step 2: Add Your First Agent (1 minute)

**What's an Agent?** Think of agents as your AI team members. Each has a specialized role.

1. Scroll down to the **"Agents"** section
2. Click **"Add Agent"** button
3. You'll see 5 smart presets - choose **🔍 Researcher**
4. The agent appears on your visual canvas!

**💡 Pro Tip**: Each preset comes pre-configured with:
- Optimal AI model (Claude Haiku for speed + cost)
- Perfect temperature setting
- Role-specific capabilities

**Agent Types**:
- **🔍 Researcher** - Fast information gathering
- **📊 Analyst** - Data analysis and insights
- **⚡ Executor** - Content creation and tasks
- **✅ Reviewer** - Quality control
- **🎨 Custom** - Build your own

✅ **You should see**: A purple gradient node on the canvas labeled "Researcher 1"

---

### Step 3: Add a Task (1 minute)

**What's a Task?** Tasks are the actual work your agents will do.

1. Scroll to the **"Tasks"** section  
   *(Note: "Add Task" is only enabled after you have at least one agent)*
2. Click **"Add Task"** button
3. A pink gradient node appears on canvas
4. Give your task a name:
   - Click **"Text"** mode button (top of page)
   - Find your task in the list
   - Change name to: **"Research HUMMBL Features"**
   - Add description: **"Find key information about HUMMBL"**

**Common Task Types**:
- Research/gathering information
- Analyzing data
- Writing content
- Reviewing work
- Making decisions

✅ **You should see**: A pink task node on the canvas with your custom name

---

### Step 4: Connect Agent to Task (1 minute)

**The Magic Moment**: Connect your agent to your task!

**Visual Mode (Recommended)**:
1. Switch back to **"Visual"** mode (button at top)
2. Find the **blue circle** on the right side of your Researcher node
3. **Click and drag** from the blue circle
4. **Drop** onto the **left side** of your Task node
5. A **blue animated line** (edge) appears!

**OR Text Mode**:
1. Stay in "Text" mode
2. Find your task
3. Use the "Assign to Agent" dropdown
4. Select "Researcher 1"

✅ **You should see**: A blue animated line connecting Researcher → Task

---

### Step 5: Save Your Workflow (30 seconds)

1. Click the **"Save Workflow"** button (top right, green)
2. You'll be redirected to your Workflows list
3. Your workflow appears with "draft" status

🎉 **Congratulations!** You've created your first workflow in under 5 minutes!

---

## What Just Happened?

You've built a complete workflow that:
- ✅ Has an AI agent (Researcher) with optimal settings
- ✅ Has a defined task (Research HUMMBL Features)
- ✅ Connects the agent to the task (who does what)
- ✅ Is saved and ready for execution

---

## Next Steps

### Level Up: Add Task Dependencies

Create a multi-step workflow:

1. **Add 2 more agents**: Executor and Reviewer
2. **Add 2 more tasks**: "Write Summary" and "Final Review"
3. **Connect**:
   - Executor → "Write Summary"
   - Reviewer → "Final Review"
4. **Create dependencies** (green edges):
   - Drag from "Research" task output → "Write Summary" input
   - Drag from "Write Summary" output → "Final Review" input

Now your workflow runs in sequence: Research → Write → Review!

---

### Try a Template

Don't want to build from scratch?

1. Go to **Templates** page (main navigation)
2. Browse pre-built workflows
3. Click **"Use This Template"**
4. Customize and save!

---

### Explore Features

**Visual Canvas Tools**:
- **Zoom**: +/- buttons or mouse wheel
- **Pan**: Click and drag background
- **Fit View**: Centers all nodes
- **Minimap**: Overview navigation (bottom-left)

**Mode Toggle**:
- **Visual**: Drag-and-drop canvas (great for overview)
- **Text**: Detailed editing (great for specifics)
- Switch anytime - no data loss!

**Agent Presets**:
- Hover over each preset to see details
- Temperature = creativity level (0.3-0.7)
- Model = which AI powers the agent

---

## Common Questions

### Q: What's the difference between an agent and a task?

**Agent** = WHO does the work (your AI team member)  
**Task** = WHAT work gets done (the actual job)  

Think: "Researcher (agent) will 'gather sources' (task)"

### Q: What do the colored edges mean?

**Blue edges** = Agent assignment (who does this task)  
**Green edges** = Dependencies (task order/flow)

### Q: Can one agent do multiple tasks?

Yes! Connect one agent to many tasks. They'll handle them all.

### Q: Can one task depend on multiple other tasks?

Yes! Create multiple green edges to the same task. It will wait for all dependencies to complete.

### Q: What happens if I delete an agent?

The workflow warns you if tasks depend on that agent. Reassign tasks first to avoid breaking your workflow.

### Q: Can I undo changes?

Currently, use browser back button or reload to discard changes. Always save when you're happy with your workflow!

---

## Troubleshooting

### Problem: "Add Task" button is grayed out

**Solution**: You need at least one agent first. Agents do tasks, so add an agent before adding tasks.

### Problem: I can't connect two agents together

**Solution**: That's correct! Agents don't connect to each other. Connect agents to tasks, and tasks to tasks (for dependencies).

### Problem: My workflow won't save

**Solution**: 
- Check that workflow has a name
- Ensure at least one agent and one task exist
- Refresh page and try again
- Check browser console for errors (F12)

### Problem: Visual canvas is too zoomed in/out

**Solution**: Use the "Fit View" button (bottom controls) to center everything. Or use zoom +/- buttons.

### Problem: I switched modes and lost my work

**Solution**: You didn't! Toggle back and forth freely. Changes persist across mode switches.

---

## Tips for Success

### 🎯 Start Simple
Build a 1-agent, 1-task workflow first. Add complexity after you're comfortable.

### 🎨 Use Visual for Planning
Visual mode is perfect for seeing the big picture and planning workflow structure.

### ✏️ Use Text for Details
Text mode makes it easy to edit names, descriptions, and configurations in bulk.

### 🏗️ Build Incrementally
Add one agent or task at a time. Test connections before adding more.

### 💾 Save Often
Click Save regularly, especially before switching modes or navigating away.

### 📊 Use Tags
Add tags like `production`, `test`, `client-work` to organize workflows.

---

## Keyboard Shortcuts

- **Delete**: Remove selected node
- **Cmd/Ctrl + Z**: Undo (coming soon)
- **Cmd/Ctrl + S**: Save workflow (coming soon)
- **Space + Drag**: Pan canvas (coming soon)

---

## What's Next?

### Ready to execute workflows?

Workflow execution is coming in the next release! For now, focus on:
- Building and organizing workflows
- Experimenting with agent types
- Creating task dependencies
- Saving templates for reuse

### Want to learn more?

- Watch our [video walkthrough](#) (link to video)
- Read the [full documentation](#) (link to docs)
- Join our [community](#) (link to Discord/Slack)

---

## Need Help?

- **Bug reports**: Click feedback button (bottom-right corner)
- **Feature requests**: Same feedback button!
- **Questions**: [Support email or community link]

---

**You're all set!** Start building amazing agentic workflows. 🚀

*Last updated: 2025-11-08*  
*HUMMBL Visual Workflow Builder v1.0*
