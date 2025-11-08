# Feature: AI-Assisted Workflow Creation
**Status**: Planned (Phase 2A - Post-Beta)  
**Priority**: High (UX Enhancement)  
**Owner**: TBD  
**Estimated Effort**: 2-3 weeks  

---

## Problem Statement

**User Pain Points** (to validate in beta):
- Writing effective task prompts is hard
- Choosing the right agents unclear
- Setting up dependencies tedious
- Empty canvas intimidating (cold start problem)

**Goal**: Reduce TTFW from 2:00 to <1:00 with AI assistance

---

## Proposed Solution

### Feature 1: AI Prompt Generator
**What**: Generate optimized task prompts based on task name and agent role  
**Where**: Task form - "✨ Generate Prompt" button  
**How**: Claude 3.5 Haiku (fast, cheap, good quality)  

**User Flow**:
1. User enters task name: "Research competitors"
2. Selects agent: "Researcher"
3. Clicks "✨ Generate Prompt"
4. AI generates: "Research and document the top 5 competitors in [industry]. Focus on: pricing models, key features, target customers, and market positioning. Provide a comparative analysis highlighting strengths and weaknesses."
5. User can edit or use as-is

**API Cost**: ~$0.0001 per generation (Haiku)

---

### Feature 2: Workflow Template Suggestions
**What**: AI suggests complete workflows from natural language goal  
**Where**: Dashboard - "✨ Create with AI" button  
**How**: Claude + RAG over template library  

**User Flow**:
1. User clicks "✨ Create with AI"
2. Modal: "What do you want to accomplish?"
3. User types: "I need to write a blog post about mental models"
4. AI suggests:
   - Workflow name: "Blog Post Creation: Mental Models"
   - Agents: Researcher → Writer → Reviewer
   - Tasks: 3 auto-generated with prompts
   - Connections: Pre-wired
5. User clicks "Create" → Workflow ready to edit/run

**API Cost**: ~$0.002 per suggestion (Haiku + embeddings)

---

### Feature 3: Smart Auto-Complete
**What**: Context-aware suggestions throughout builder  
**Where**: All form fields  
**How**: Hybrid (AI + heuristics)  

**Examples**:
- Agent description auto-completes based on role
- Task dependencies suggested based on type
- Tags auto-suggested based on workflow name
- Connection hints (which agents pair with which tasks)

---

## Technical Architecture

### Backend API (Cloudflare Workers)
```typescript
// POST /api/ai/generate-prompt
interface GeneratePromptRequest {
  taskName: string;
  agentRole: AgentRole;
  context?: string; // Optional workflow context
}

interface GeneratePromptResponse {
  prompt: string;
  confidence: number; // 0-1
  alternatives?: string[]; // Other suggestions
}
```

### Frontend Integration
```typescript
// src/services/ai.ts
export async function generateTaskPrompt(
  taskName: string,
  agentRole: AgentRole,
  apiKey: string
): Promise<string> {
  const response = await fetch('/api/ai/generate-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskName, agentRole })
  });
  
  const data = await response.json();
  return data.prompt;
}
```

### Caching Strategy
- Cache common patterns (KV storage)
- User-specific cache (session storage)
- Fallback to templates if API fails

---

## UI/UX Design

### Prompt Generator Button
```
┌─────────────────────────────────────┐
│ Task Name                           │
│ ┌─────────────────────────────────┐ │
│ │ Research competitors            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Prompt                              │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ ✨ Generate Prompt ]              │
└─────────────────────────────────────┘
```

### AI Workflow Creation Modal
```
┌──────────────────────────────────────────┐
│ ✨ Create Workflow with AI               │
│                                          │
│ What do you want to accomplish?          │
│ ┌──────────────────────────────────────┐ │
│ │ Write a technical blog post about... │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [ Cancel ]              [ Generate ✨ ]  │
└──────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 2A: Prompt Generator (Week 2)
**Effort**: 1-2 days  
**Deliverables**:
- API endpoint for prompt generation
- UI button in task form
- Caching layer
- Error handling
- Usage tracking

**Acceptance Criteria**:
- ✅ Generates relevant prompts in <2s
- ✅ Works offline (fallback to templates)
- ✅ Costs < $0.0001 per generation
- ✅ 90% user satisfaction (survey)

### Phase 2B: Template Suggestions (Week 3-4)
**Effort**: 2-3 days  
**Deliverables**:
- RAG system over templates
- Natural language to workflow converter
- Dashboard integration
- Preview modal

**Acceptance Criteria**:
- ✅ Suggests relevant workflows 80% of time
- ✅ Reduces TTFW by 30%
- ✅ Templates editable before creation

### Phase 2C: Smart Defaults (Week 5-6)
**Effort**: 2-3 days  
**Deliverables**:
- Auto-complete for all fields
- Connection suggestions
- Dependency hints
- Context-aware tooltips

**Acceptance Criteria**:
- ✅ Reduces form filling time by 40%
- ✅ Suggestions accepted 60% of time
- ✅ No degradation in quality

---

## Success Metrics

| Metric | Baseline (Manual) | Target (AI-Assisted) |
|--------|------------------|---------------------|
| **TTFW** | 2:00 | <1:00 (50% reduction) |
| **Task Prompt Quality** | Variable | 4.0/5 avg (user rating) |
| **Workflow Completion Rate** | TBD | +30% |
| **User Satisfaction** | TBD | 4.5/5 |
| **Feature Adoption** | N/A | 70% use AI at least once |

---

## Cost Analysis

**Per Workflow Creation**:
- Prompt generation (3 tasks avg): $0.0003
- Template suggestion: $0.002
- Total: ~$0.0023 per workflow

**Monthly (100 workflows)**:
- Direct cost: $0.23
- Infrastructure: $5 (Cloudflare Workers)
- **Total**: ~$5.23/month

**ROI**: Massive UX improvement for negligible cost

---

## Dependencies

### Technical
- ✅ Cloudflare Workers backend (planned)
- ✅ Claude API access (have key)
- ✅ D1 database (for caching)
- ⏳ Template library (need more templates)

### Non-Technical
- Beta user feedback on pain points
- TTFW baseline data
- Prompt engineering expertise
- UX testing with AI features

---

## Risks & Mitigations

### Risk 1: AI Generates Poor Prompts
**Mitigation**:
- Extensive prompt engineering
- User can always edit
- Fallback to curated templates
- Collect feedback to improve

### Risk 2: API Costs Escalate
**Mitigation**:
- Aggressive caching (KV)
- Rate limiting per user
- Use Haiku (cheapest) for most calls
- Only Sonnet for complex workflows

### Risk 3: Slower Than Manual
**Mitigation**:
- Optimize for <2s generation
- Show loading states
- Allow manual while AI loads
- Cache common patterns

### Risk 4: Over-Reliance on AI
**Mitigation**:
- Always show "manual" option
- Teach users best practices
- AI as assistant, not replacement
- Gradual rollout (A/B test)

---

## Alternative Approaches Considered

### 1. Template-Only (No AI)
**Pros**: Simpler, faster, cheaper  
**Cons**: Less flexible, more templates needed  
**Decision**: Good for Phase 1, add AI in Phase 2

### 2. Full Codegen (AI Writes Entire Workflow)
**Pros**: Maximum automation  
**Cons**: Less user control, higher cost, trust issues  
**Decision**: Too aggressive for MVP

### 3. Community Prompts (User-Generated)
**Pros**: Free, authentic, improves over time  
**Cons**: Quality varies, cold start problem  
**Decision**: Add as Phase 3 (after AI)

---

## User Stories

### Story 1: First-Time User
**As a** new user unfamiliar with prompt engineering  
**I want to** generate effective task prompts automatically  
**So that** I can create workflows without AI expertise

**Acceptance**:
- Can create workflow in <1:00
- Prompts are clear and actionable
- Can edit AI suggestions
- Learns best practices from examples

### Story 2: Power User
**As an** experienced user creating many workflows  
**I want to** quickly scaffold workflows from goals  
**So that** I can save time on repetitive setup

**Acceptance**:
- Natural language → workflow in 30s
- Suggestions are relevant 80% of time
- Can customize before creating
- Templates learn from my patterns

### Story 3: Domain Expert
**As a** user with specific expertise  
**I want** AI to adapt to my domain vocabulary  
**So that** generated prompts match my context

**Acceptance**:
- Can provide context/examples
- AI learns from my edits
- Domain-specific suggestions
- Option to save custom templates

---

## Open Questions

1. **Should AI suggest agent configurations** (temperature, model) or just prompts?
2. **How much context** should we pass to AI (full workflow vs. just task)?
3. **Should users see confidence scores** on AI suggestions?
4. **Multi-language support** for non-English prompts?
5. **Privacy**: Do we log prompts for improvement (with opt-in)?

**Decision**: Resolve during beta feedback analysis

---

## Next Steps

### Before Implementation:
1. ✅ Complete beta launch
2. ✅ Collect baseline TTFW data
3. ✅ Survey users on pain points
4. ✅ Analyze where users struggle most
5. ⏳ Prioritize features by impact

### Week 1 (Beta):
- Launch without AI
- Monitor user behavior
- Collect feedback on prompt writing
- Identify common workflow patterns

### Week 2 (Planning):
- Analyze beta results
- Design AI features based on data
- Prototype prompt generation
- Test with power users

### Week 3 (Implementation):
- Build Phase 2A (Prompt Generator)
- Test with subset of users
- Measure TTFW improvement
- Iterate based on feedback

---

## Related Documents

- `QUICKSTART_GUIDE.md` - Current manual workflow creation
- `VWB_USER_TESTING_GUIDE.md` - Testing methodology
- `BACKEND_SETUP.md` - Cloudflare Workers architecture
- `PRODUCTION_READINESS_CHECKLIST.md` - Launch requirements

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-08 | 0.1 | Initial draft from user suggestion | Cascade |

---

**Status**: Draft - Pending beta validation  
**Next Review**: After Week 1 beta results  
**Owner**: TBD  
**Estimated Launch**: Week 3 (post-beta)
