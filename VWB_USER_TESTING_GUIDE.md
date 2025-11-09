# Visual Workflow Builder - User Testing Guide
**Project**: HUMMBL-VWB-MVP-1.0  
**Version**: 1.0.0  
**Date**: 2025-11-08  
**Test Environment**: https://hummbl.vercel.app  

---

## Overview

This guide provides structured test scenarios to validate the Visual Workflow Builder MVP features, including agent presets, visual canvas, edge synchronization, and telemetry tracking.

**Target Metrics**:
- TTFW (Time To First Win): 1:18 or less
- Visual Adoption: 92% preference for visual mode
- Delight Score: 4.7/5 average satisfaction

---

## Pre-Test Setup

### Environment Check
- [ ] Browser: Chrome, Firefox, Safari, or Edge (latest version)
- [ ] Screen size: Minimum 1280x720 (desktop recommended)
- [ ] Network: Stable internet connection
- [ ] JavaScript: Enabled
- [ ] Browser console: Open (F12) to monitor telemetry events

### Initial State Verification
1. Navigate to https://hummbl.vercel.app
2. Verify page loads successfully
3. Confirm empty dashboard state:
   - 0 Workflows
   - 0 Active workflows
   - 0 Agents
   - "No workflows yet" message visible

---

## Test Scenario 1: First Workflow Creation (TTFW)

**Goal**: Measure Time To First Win - how quickly a user can create and save their first workflow.

**Start Timer**: When user clicks "New Workflow" button  
**Stop Timer**: When workflow is successfully saved

### Steps

1. **Navigate to Workflow Creation**
   - [ ] Click "New Workflow" button (Dashboard or top nav)
   - [ ] Page loads to `/workflows/new`
   - [ ] Visual Workflow Canvas is visible by default
   - [ ] Timer started: Record timestamp

2. **Set Workflow Details**
   - [ ] Enter name: "My First Workflow"
   - [ ] Enter description: "Testing the visual workflow builder"
   - [ ] Add tags: "test", "first-run"

3. **Add First Agent (Using Preset)**
   - [ ] Click "Add Agent" button
   - [ ] Agent presets panel expands
   - [ ] Verify 5 presets visible:
     - 🔍 Researcher
     - 📊 Analyst
     - ⚡ Executor
     - ✅ Reviewer
     - 🎨 Custom
   - [ ] Click "Researcher" preset
   - [ ] Agent appears in visual canvas
   - [ ] Verify agent node shows:
     - Agent name
     - Role
     - Model (claude-3-haiku-20240307)

4. **Add First Task**
   - [ ] Click "Add Task" button (only enabled after agent exists)
   - [ ] Task node appears in visual canvas
   - [ ] Verify task shows placeholder name "Task 1"

5. **Connect Agent to Task**
   - [ ] Drag from blue handle on agent node
   - [ ] Drop on left handle of task node
   - [ ] Verify edge (connection line) appears
   - [ ] Edge should be blue and animated
   - [ ] Task should now show "→ [Agent Name]"

6. **Save Workflow**
   - [ ] Click "Save" button (top right)
   - [ ] Redirects to `/workflows` list
   - [ ] New workflow appears in list
   - [ ] Timer stopped: Record timestamp

7. **Calculate TTFW**
   - Target: ≤ 1:18 (78 seconds)
   - Record: ___:___ (your time)
   - Status: ✅ Pass / ❌ Fail

### Expected Console Output
```
[Telemetry] workflow_created {workflow_id: "...", task_count: 1, agent_count: 1, ...}
[Telemetry] ttfw_achieved {time_to_first_win_seconds: XX, time_to_first_win_formatted: "X:XX"}
```

---

## Test Scenario 2: Agent Preset Validation

**Goal**: Verify all agent presets load correctly with proper defaults.

### Steps

1. **Test Each Preset**

   **Researcher Preset**
   - [ ] Click "Add Agent" → Select "Researcher"
   - [ ] Verify details:
     - Name: "Researcher 1" (or similar)
     - Role: researcher
     - Icon: 🔍
     - Model: claude-3-haiku-20240307
     - Temperature: 0.3
     - Capabilities include: Web research, Data extraction, etc.

   **Analyst Preset**
   - [ ] Add another agent → Select "Analyst"
   - [ ] Verify:
     - Role: analyst
     - Icon: 📊
     - Temperature: 0.5

   **Executor Preset**
   - [ ] Add agent → Select "Executor"
   - [ ] Verify:
     - Role: executor
     - Icon: ⚡
     - Temperature: 0.7

   **Reviewer Preset**
   - [ ] Add agent → Select "Reviewer"
   - [ ] Verify:
     - Role: reviewer
     - Icon: ✅
     - Temperature: 0.4

   **Custom Preset**
   - [ ] Add agent → Select "Custom"
   - [ ] Verify:
     - Role: custom
     - Icon: 🎨
     - Temperature: 0.7
     - Empty capabilities (user defines)

2. **Verify Preset Guidance**
   - [ ] Each preset shows descriptive text
   - [ ] Hover states work (visual feedback)
   - [ ] "💡 Each preset includes optimized model..." hint visible

---

## Test Scenario 3: Visual Canvas Interaction

**Goal**: Test drag-and-drop, zoom, pan, and visual controls.

### Steps

1. **Canvas Controls**
   - [ ] Zoom in (+) button works
   - [ ] Zoom out (-) button works
   - [ ] Fit view button centers canvas
   - [ ] Mini-map shows overview of nodes
   - [ ] Mini-map is interactive (click to navigate)

2. **Node Manipulation**
   - [ ] Drag agent node to reposition
   - [ ] Drag task node to reposition
   - [ ] Nodes snap to position smoothly
   - [ ] Edges update automatically when nodes move

3. **Edge Creation**
   - [ ] Drag from agent output handle (right side, blue)
   - [ ] Valid drop targets highlight
   - [ ] Cannot connect agent to agent (invalid)
   - [ ] Can connect agent to task (valid)
   - [ ] Can connect task to task (dependency, green edge)

4. **Edge Validation**
   - [ ] Try to create circular dependency:
     - Create Task A → Task B → Task A loop
     - Should prevent or warn about cycle
   - [ ] Edge styles differ:
     - Agent→Task: Blue, animated
     - Task→Task: Green, solid

5. **Background & Grid**
   - [ ] Dot pattern background visible
   - [ ] Grid helps with alignment
   - [ ] Canvas can be panned (click + drag)

---

## Test Scenario 4: Visual vs. Text Mode Toggle

**Goal**: Verify mode switching and data persistence.

### Steps

1. **Create Workflow in Visual Mode**
   - [ ] Add 2 agents
   - [ ] Add 3 tasks
   - [ ] Connect agents to tasks

2. **Switch to Text Mode**
   - [ ] Click "Text" button (top of page)
   - [ ] Visual canvas hides
   - [ ] Text-based editor appears
   - [ ] Verify all agents listed with details
   - [ ] Verify all tasks listed with details

3. **Edit in Text Mode**
   - [ ] Modify task name
   - [ ] Change agent assignment (dropdown)
   - [ ] Add task description

4. **Switch Back to Visual Mode**
   - [ ] Click "Visual" button
   - [ ] Canvas reappears
   - [ ] Verify changes from text mode are reflected
   - [ ] Node positions preserved

5. **Data Integrity**
   - [ ] No data loss when switching modes
   - [ ] Edges still connected correctly
   - [ ] All edits persisted

---

## Test Scenario 5: Task Dependencies

**Goal**: Test task→task connections for workflow orchestration.

### Steps

1. **Create Multi-Task Workflow**
   - [ ] Add 1 agent
   - [ ] Add 3 tasks: "Research", "Analyze", "Report"
   - [ ] Assign all tasks to the agent

2. **Create Linear Dependency Chain**
   - [ ] Connect Research (output) → Analyze (dependency input)
   - [ ] Connect Analyze (output) → Report (dependency input)
   - [ ] Verify green dependency edges appear
   - [ ] Verify dependency count shows in task details

3. **Test Parallel Dependencies**
   - [ ] Add 2 more tasks: "Task A", "Task B"
   - [ ] Connect both to final task
   - [ ] Verify both dependencies tracked

4. **Verify Dependency Validation**
   - [ ] Task cannot depend on itself (should prevent)
   - [ ] Circular dependencies prevented or warned
   - [ ] Dependency order matters for execution

---

## Test Scenario 6: Workflow Execution Simulation

**Goal**: Prepare workflow for execution and validate completeness.

### Steps

1. **Create Complete Workflow**
   - [ ] Name: "Content Research Pipeline"
   - [ ] Add agents: Researcher, Writer, Reviewer
   - [ ] Add tasks:
     - "Gather Sources" → Researcher
     - "Write Draft" → Writer (depends on Gather)
     - "Final Review" → Reviewer (depends on Write)

2. **Validate Before Execution**
   - [ ] All tasks have assigned agents
   - [ ] Dependencies are logical
   - [ ] No orphaned nodes
   - [ ] Visual graph flows left→right

3. **Save and Verify**
   - [ ] Click Save
   - [ ] Return to workflow list
   - [ ] Workflow shows "draft" status
   - [ ] Click into workflow detail
   - [ ] Verify all data persisted

---

## Test Scenario 7: Telemetry Event Tracking

**Goal**: Verify analytics events are captured correctly.

### Pre-requisite
- [ ] Open browser console (F12)
- [ ] Filter console to show "[Telemetry]" messages

### Events to Verify

1. **Visual Builder Events**
   ```
   [Telemetry] visual_builder_opened
   [Telemetry] agent_added {session_duration: XX}
   [Telemetry] task_added {session_duration: XX}
   [Telemetry] connection_created {session_duration: XX}
   ```

2. **Workflow Events**
   ```
   [Telemetry] workflow_created {
     workflow_id: "...",
     task_count: X,
     agent_count: X,
     success: true
   }
   ```

3. **TTFW Event** (first workflow only)
   ```
   [Telemetry] ttfw_achieved {
     time_to_first_win_seconds: XX,
     time_to_first_win_formatted: "X:XX"
   }
   ```

4. **Verify in Local Storage**
   - [ ] Open DevTools → Application → Local Storage
   - [ ] Find key: `hummbl_delight_metrics`
   - [ ] Should contain aggregated metrics (after feedback)

---

## Test Scenario 8: Delight Modal Feedback

**Goal**: Capture user satisfaction metrics post-workflow completion.

**Note**: DelightModal appears after workflow execution completes. Since execution isn't implemented in MVP, you can test the component directly:

### Manual Test (DevTools Console)
```javascript
// Simulate workflow completion
localStorage.setItem('hummbl_show_delight', 'true');
// Reload page and modal should appear
```

### When Modal Appears

1. **Modal Content**
   - [ ] Title: "🎉 Workflow Complete!"
   - [ ] Shows workflow name
   - [ ] 5 emoji rating scale (😞 😐 🙂 😊 🤩)
   - [ ] Ease of use slider (TTFW metric)
   - [ ] Visual satisfaction slider
   - [ ] Recommendation checkbox
   - [ ] Optional comment text area

2. **Interaction**
   - [ ] Click rating emoji (1-5)
   - [ ] Selected emoji highlights with blue border
   - [ ] Adjust ease slider (1-5)
   - [ ] Adjust visual slider (1-5)
   - [ ] Check/uncheck recommendation
   - [ ] Type feedback comment

3. **Submit Feedback**
   - [ ] Click "Submit Feedback"
   - [ ] Modal closes
   - [ ] Console shows:
     ```
     [Telemetry] delight_feedback_submitted {
       overall_score: X,
       ease_satisfaction: X,
       visual_satisfaction: X,
       average_score: X.X,
       will_recommend: true/false,
       has_comment: true/false
     }
     ```

4. **Metrics Storage**
   - [ ] Check localStorage: `hummbl_delight_metrics`
   - [ ] Should contain:
     - scores array
     - avgDelightScore
     - visualAdoptionRate
     - count

---

## Test Scenario 9: Edge Synchronization

**Goal**: Verify auto-edge updates and cleanup.

### Steps

1. **Auto-Connect Test**
   - [ ] Add agent in visual mode
   - [ ] Add task
   - [ ] Switch to text mode
   - [ ] Assign agent to task via dropdown
   - [ ] Switch back to visual mode
   - [ ] Verify edge automatically created

2. **Orphaned Edge Cleanup**
   - [ ] Create agent→task connection
   - [ ] Delete the agent (text mode)
   - [ ] Return to visual mode
   - [ ] Verify orphaned edge is removed

3. **Reassignment Test**
   - [ ] Create Task A with Agent 1
   - [ ] Edge appears: Agent 1 → Task A
   - [ ] Reassign Task A to Agent 2 (text mode)
   - [ ] Return to visual
   - [ ] Verify edge updates: Agent 2 → Task A

---

## Test Scenario 10: Workflow Templates

**Goal**: Test pre-built template instantiation.

### Steps

1. **Browse Templates**
   - [ ] Click "Templates" in main nav
   - [ ] Verify templates page loads
   - [ ] Templates displayed with:
     - Name
     - Description
     - Category
     - Tags

2. **Use Template**
   - [ ] Click "Use This Template" on any template
   - [ ] Template loads into editor
   - [ ] Pre-configured agents appear
   - [ ] Pre-configured tasks appear
   - [ ] Edges auto-created
   - [ ] Can edit/customize from template base

---

## Performance Benchmarks

### Load Time Targets
- [ ] Dashboard initial load: < 2 seconds
- [ ] Workflow editor load: < 3 seconds
- [ ] Visual canvas render: < 1 second
- [ ] Agent preset load: < 500ms
- [ ] Save operation: < 2 seconds

### Bundle Size (Reference)
- Total: 464.52 kB (139.69 kB gzipped)
- Acceptable for MVP

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Esc closes modals
- [ ] Focus indicators visible

### Screen Reader
- [ ] Search input has aria-label
- [ ] Buttons have descriptive labels
- [ ] Form fields have labels
- [ ] Error messages announced

### Visual
- [ ] Contrast ratios meet WCAG AA
- [ ] Text readable at 200% zoom
- [ ] Color not sole indicator
- [ ] Focus states visible

---

## Browser Compatibility

Test on multiple browsers:

- [ ] **Chrome** (latest): Full functionality
- [ ] **Firefox** (latest): Full functionality
- [ ] **Safari** (latest): Full functionality
- [ ] **Edge** (latest): Full functionality
- [ ] **Mobile Safari** (iOS): Basic functionality
- [ ] **Chrome Mobile** (Android): Basic functionality

---

## Known Issues & Limitations

### Expected Behavior (Not Bugs)
- [ ] DelightModal doesn't auto-appear (execution not implemented)
- [ ] onboarding.hum is spec only (parser not built)
- [ ] Telemetry uses localStorage (backend sync pending)
- [ ] No real-time collaboration yet (Phase 2)

### Report These Issues
- Workflows not saving
- Visual canvas not loading
- Agent presets not appearing
- Edges not connecting
- Mode toggle not working
- Console errors (except known warnings)

---

## Test Report Template

```markdown
# VWB Test Report

**Tester**: [Name]
**Date**: [YYYY-MM-DD]
**Environment**: [Browser + Version]
**Device**: [Desktop/Mobile, OS]

## Test Results

### TTFW Score
- Time: ___:___ (target: ≤ 1:18)
- Status: ✅ Pass / ❌ Fail

### Scenarios Completed
- [ ] Scenario 1: First Workflow Creation
- [ ] Scenario 2: Agent Preset Validation
- [ ] Scenario 3: Visual Canvas Interaction
- [ ] Scenario 4: Visual vs Text Toggle
- [ ] Scenario 5: Task Dependencies
- [ ] Scenario 6: Workflow Execution Sim
- [ ] Scenario 7: Telemetry Tracking
- [ ] Scenario 8: Delight Modal
- [ ] Scenario 9: Edge Synchronization
- [ ] Scenario 10: Workflow Templates

### Issues Found
1. [Issue description]
2. [Issue description]

### User Experience Rating
- Ease of Use: __ / 5
- Visual Appeal: __ / 5
- Performance: __ / 5
- Overall: __ / 5

### Delight Score (if modal tested)
- Overall: __ / 5
- TTFW Satisfaction: __ / 5
- Visual Satisfaction: __ / 5
- Would Recommend: Yes / No

### Additional Comments
[Free-form feedback]
```

---

## Next Steps After Testing

### If All Tests Pass ✅
- Collect feedback from 5+ users
- Calculate average TTFW
- Measure visual adoption rate
- Aggregate delight scores
- Plan Phase 2 features

### If Issues Found ❌
- Document issues with screenshots
- Note reproduction steps
- Assign priority (P0-P3)
- Create fix plan
- Re-test after fixes

---

**Test Completion**: When all scenarios executed and report submitted  
**Success Criteria**: 80% of tests pass, TTFW ≤ 1:18, Delight ≥ 4.0  
**Contact**: Submit issues to project repository or team channel
