# AI Model Management Guide
**HUMMBL Systems** | Version 1.0.0 | Updated: 2025-11-08

---

## Overview

HUMMBL supports **ALL models** from Claude (Anthropic) and OpenAI that users have API access to. This guide explains how to add new models as they're released.

---

## Quick Start: Adding a New Model

### 1. Open `/src/config/aiModels.ts`

### 2. Add to the appropriate array

**For Claude models**, add to `CLAUDE_MODELS`:
```typescript
{
  id: 'claude-5-sonnet',  // API model ID
  name: 'Claude Sonnet 5',  // Display name
  provider: 'anthropic',
  family: 'Claude 5',
  description: 'Next generation Claude model',
  contextWindow: 200000,
  inputCost: 3,  // $/1M tokens
  outputCost: 15, // $/1M tokens
  speed: 'fast',  // 'very-fast' | 'fast' | 'medium' | 'slow'
  capabilities: ['reasoning', 'coding', 'analysis', 'writing'],
  released: '2025-01', // YYYY-MM format
  recommended: true, // Optional: mark as recommended
},
```

**For OpenAI models**, add to `OPENAI_MODELS`:
```typescript
{
  id: 'gpt-5',
  name: 'GPT-5',
  provider: 'openai',
  family: 'GPT-5',
  description: 'Next generation GPT model',
  contextWindow: 256000,
  inputCost: 5,
  outputCost: 20,
  speed: 'fast',
  capabilities: ['reasoning', 'coding', 'vision', 'audio'],
  released: '2025-03',
  recommended: true,
},
```

### 3. That's it!

The model is now available:
- ✅ In agent creation dropdown
- ✅ In settings/preferences
- ✅ In AI-assisted features
- ✅ Users can select it if their API key supports it

---

## Model Properties Explained

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | API model identifier | `'claude-4-sonnet'` |
| `name` | string | Human-readable name | `'Claude Sonnet 4'` |
| `provider` | string | `'anthropic'` or `'openai'` | `'anthropic'` |
| `family` | string | Model family/generation | `'Claude 4'` |
| `description` | string | Brief description | `'Best balanced performance'` |
| `contextWindow` | number | Max tokens (input + output) | `200000` |
| `inputCost` | number | Cost per 1M input tokens (USD) | `3` |
| `outputCost` | number | Cost per 1M output tokens (USD) | `15` |
| `speed` | string | Relative speed tier | `'fast'` |
| `capabilities` | string[] | What the model can do | `['coding', 'reasoning']` |
| `released` | string | Release date (YYYY-MM) | `'2024-11'` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `recommended` | boolean | Show as recommended choice |

### Speed Tiers

- `'very-fast'`: < 1 second for typical requests (Haiku-class)
- `'fast'`: 1-2 seconds (Sonnet-class)
- `'medium'`: 2-5 seconds (GPT-4-class)
- `'slow'`: 5+ seconds (Opus-class, o1-class)

### Common Capabilities

- `'reasoning'`: Logical thinking, problem-solving
- `'coding'`: Programming, code generation
- `'analysis'`: Data analysis, insights
- `'writing'`: Content creation, editing
- `'vision'`: Image understanding
- `'audio'`: Audio processing
- `'math'`: Advanced mathematics
- `'science'`: Scientific reasoning
- `'advanced-reasoning'`: Complex multi-step reasoning (o1-class)

---

## Finding Model Information

### Anthropic Models

**Where to find**:
1. Official Docs: https://docs.anthropic.com/claude/docs/models-overview
2. API Console: https://console.anthropic.com/
3. Announcement: Usually on their blog

**What to check**:
- Model ID (for `id` field)
- Context window
- Pricing (input/output per 1M tokens)
- Release date
- Capabilities

### OpenAI Models

**Where to find**:
1. Official Docs: https://platform.openai.com/docs/models
2. API Platform: https://platform.openai.com/
3. Pricing: https://openai.com/api/pricing/

**What to check**:
- Model ID (for `id` field)
- Context window
- Pricing (input/output per 1M tokens)
- Release date
- Special features (vision, audio, etc.)

---

## Examples: Real Model Additions

### Example 1: Claude Model Update

When Claude 4.5 is announced:

```typescript
// Add to CLAUDE_MODELS array
{
  id: 'claude-4-5-sonnet-20250315',
  name: 'Claude Sonnet 4.5',
  provider: 'anthropic',
  family: 'Claude 4.5',
  description: 'Enhanced reasoning and coding capabilities',
  contextWindow: 200000,
  inputCost: 3,
  outputCost: 15,
  speed: 'fast',
  capabilities: ['reasoning', 'coding', 'analysis', 'writing', 'vision'],
  released: '2025-03',
  recommended: true, // Mark new flagship
},
```

**Don't forget**: Update `DEFAULT_MODELS.general` if this is the new flagship!

### Example 2: OpenAI Model Update

When GPT-4.5 is announced:

```typescript
// Add to OPENAI_MODELS array
{
  id: 'gpt-4.5-turbo',
  name: 'GPT-4.5 Turbo',
  provider: 'openai',
  family: 'GPT-4.5',
  description: 'Next generation GPT with improved reasoning',
  contextWindow: 256000,
  inputCost: 5,
  outputCost: 20,
  speed: 'fast',
  capabilities: ['reasoning', 'coding', 'vision', 'analysis'],
  released: '2025-06',
  recommended: true,
},
```

### Example 3: New Model Family

When a completely new model family launches:

```typescript
// For a hypothetical "Claude Reasoning" family
{
  id: 'claude-reasoning-1',
  name: 'Claude Reasoning 1',
  provider: 'anthropic',
  family: 'Claude Reasoning',  // New family!
  description: 'Specialized for complex reasoning tasks',
  contextWindow: 300000,
  inputCost: 10,
  outputCost: 50,
  speed: 'slow',
  capabilities: ['advanced-reasoning', 'math', 'science', 'coding'],
  released: '2025-09',
  recommended: false, // Specialized, not general purpose
},
```

---

## Updating Default Recommendations

### When to Update `DEFAULT_MODELS`

Update `/src/config/aiModels.ts` → `DEFAULT_MODELS` when:
- A new flagship model is released
- Pricing changes significantly
- A faster model with same quality is available

```typescript
export const DEFAULT_MODELS = {
  general: 'claude-5-sonnet',  // Update when new flagship
  fast: 'claude-5-haiku',       // Update when faster model
  quality: 'claude-5-opus',     // Update when better model
  budget: 'gpt-4o-mini',        // Update if cheaper alternative
  reasoning: 'o2',              // Update when new reasoning model
};
```

### Impact of Updating Defaults

**Agent Presets (`agentPresets.ts`) automatically use new defaults**:
```typescript
// No changes needed! These reference DEFAULT_MODELS
researcher: { model: DEFAULT_MODELS.fast }
analyst: { model: DEFAULT_MODELS.general }
```

---

## Testing New Models

### Before Deploying

1. **Verify API Access**
   ```bash
   # Test with curl
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -d '{"model": "claude-4-sonnet", ...}'
   ```

2. **Test in Settings Page**
   - Add API key
   - Create workflow
   - Select new model from dropdown
   - Generate a task prompt

3. **Verify Pricing**
   - Check console for token usage
   - Calculate actual cost
   - Confirm matches documentation

### After Deploying

1. **Monitor Usage**
   - Check Vercel Analytics
   - Track which models users choose
   - Monitor costs

2. **Collect Feedback**
   - Ask beta users about quality
   - Compare speeds
   - Adjust recommendations if needed

---

## Deprecating Old Models

### When to Remove Models

- Model is officially deprecated by provider
- Model is no longer cost-effective
- Newer model in family is strictly better

### How to Deprecate

**Option A: Mark as Deprecated (Recommended)**
```typescript
{
  id: 'claude-3-haiku-20240307',
  name: 'Claude Haiku 3 (Deprecated)',  // Add note
  // ... other fields
  deprecated: true,  // Add this field
}
```

**Option B: Remove Entirely**
```typescript
// Just delete the model object from array
// Users with this model saved will see error
// Only do this if model is completely unavailable
```

---

## Model ID Format Guide

### Anthropic Claude

**Format**: `claude-{generation}-{tier}-{release-date}`

Examples:
- `claude-3-opus-20240229`
- `claude-3-5-sonnet-20241022`
- `claude-4-sonnet`
- `claude-4-haiku`

**Tiers**: `opus` (best) > `sonnet` (balanced) > `haiku` (fast)

### OpenAI GPT

**Format varies by family**:

**GPT-4o**: `gpt-4o`, `gpt-4o-mini`, `gpt-4o-audio-preview`  
**o1**: `o1`, `o1-preview`, `o1-mini`  
**GPT-4**: `gpt-4`, `gpt-4-turbo`, `gpt-4-turbo-preview`  
**GPT-3.5**: `gpt-3.5-turbo`

---

## FAQ

### Q: Do I need to update the code when users get access to new models?

**A: No!** Users automatically get access to any model their API key supports. You only need to update `aiModels.ts` so:
1. The model appears in dropdowns with correct info
2. Cost calculations are accurate
3. Smart defaults stay current

### Q: What if a user's API key doesn't support a model they select?

**A: The API will return an error**, which the app will handle gracefully and show the user an error message. They can then select a different model.

### Q: Should I add every single model variant?

**A: Add the most relevant ones**:
- ✅ Latest version of each tier (Opus, Sonnet, Haiku)
- ✅ Models with unique capabilities (vision, audio, reasoning)
- ❌ Old deprecated versions (unless users still use them)
- ❌ Tiny variations (same capability, minor version bump)

### Q: How do I know the exact model IDs?

**A: Check the provider docs**:
- Anthropic: https://docs.anthropic.com/claude/docs/models-overview
- OpenAI: https://platform.openai.com/docs/models

### Q: Can I add models from other providers (Gemini, Mistral, etc.)?

**A: Yes!** The architecture supports it:
1. Add new provider type to `AIProvider` union
2. Add new array like `GEMINI_MODELS`
3. Update `getAllModels()` to include new array
4. Update `ai.ts` service to support new API

---

## Maintenance Checklist

### Monthly (or when new models announced)

- [ ] Check Anthropic blog/docs for new models
- [ ] Check OpenAI blog/docs for new models
- [ ] Update `aiModels.ts` with new models
- [ ] Test new models if you have API access
- [ ] Update `DEFAULT_MODELS` if flagship changed
- [ ] Update this guide with any new patterns
- [ ] Commit and deploy changes

### Quarterly

- [ ] Review deprecated models, consider removing
- [ ] Check if pricing changed
- [ ] Validate all model IDs still work
- [ ] Review user feedback on model choices
- [ ] Update recommendations based on usage data

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-08 | 1.0.0 | Initial model catalog with Claude 4.x and all GPT models |

---

## Resources

- **Anthropic Docs**: https://docs.anthropic.com/
- **OpenAI Docs**: https://platform.openai.com/docs
- **This Project**: `/src/config/aiModels.ts`
- **Agent Presets**: `/src/config/agentPresets.ts`
- **AI Service**: `/src/services/ai.ts`

---

**Questions?** Check the code comments in `aiModels.ts` or review recent model announcements from providers.

**Need help?** The model catalog is designed to be self-documenting. Each model object tells you everything you need to know! 🚀
