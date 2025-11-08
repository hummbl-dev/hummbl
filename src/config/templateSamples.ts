/**
 * Template Sample Data
 * 
 * Example inputs and expected outputs for each workflow template.
 * Helps users understand what templates do before creating workflows.
 * 
 * @module TemplateSamples
 * @version 1.0.0
 */

export interface TemplateSample {
  templateId: string;
  useCase: string;
  sampleInput: {
    description: string;
    data: Record<string, unknown>;
  };
  expectedOutput: {
    description: string;
    example: string;
  };
  benefits: string[];
  bestFor: string[];
}

export const TEMPLATE_SAMPLES: Record<string, TemplateSample> = {
  'template-research-analysis': {
    templateId: 'template-research-analysis',
    useCase: 'Comprehensive market research and competitive analysis',
    sampleInput: {
      description: 'Research topic or question to investigate',
      data: {
        topic: 'AI-powered workflow automation market trends 2025',
        sources: ['industry reports', 'competitor websites', 'analyst reviews'],
      },
    },
    expectedOutput: {
      description: 'Structured research report with analysis and insights',
      example: `# Market Research Report: AI Workflow Automation 2025

## Executive Summary
The AI workflow automation market is projected to grow 45% YoY...

## Key Findings
1. Rising demand for no-code solutions
2. Visual builders increase adoption by 60%
3. Integration capabilities are top priority

## Competitive Landscape
- Company A: Strong in enterprise, weak in UX
- Company B: Great UI, limited AI capabilities

## Recommendations
Focus on visual workflow builder as key differentiator...`,
    },
    benefits: [
      'Saves 8-10 hours of manual research time',
      'Structured, comprehensive output',
      'Identifies patterns humans might miss',
    ],
    bestFor: [
      'Market research and competitive analysis',
      'Academic research projects',
      'Due diligence and business intelligence',
    ],
  },

  'template-content-generation': {
    templateId: 'template-content-generation',
    useCase: 'Generate high-quality blog posts with SEO optimization',
    sampleInput: {
      description: 'Content topic, target audience, and key points',
      data: {
        topic: 'How AI Workflow Automation Saves Time for Small Businesses',
        targetAudience: 'Small business owners, 25-50 employees',
        keyPoints: ['cost savings', 'efficiency gains', 'competitive advantage'],
        tone: 'professional but approachable',
      },
    },
    expectedOutput: {
      description: 'SEO-optimized blog post with title, meta, and formatted content',
      example: `# How AI Workflow Automation Saves Small Businesses 15+ Hours Per Week

**Meta Description:** Discover how small businesses are using AI workflow automation to cut costs, boost efficiency, and compete with larger companies.

## Introduction
Small businesses face a unique challenge: doing more with less...

## 3 Ways AI Automation Transforms Operations
### 1. Eliminate Repetitive Tasks (Save 8-10 hours/week)
...

## Real Results: Case Studies
Company X reduced manual data entry by 90%...

## Getting Started: 3-Step Action Plan
1. Identify repetitive workflows...`,
    },
    benefits: [
      'Produces 2000+ word articles in 5 minutes',
      'SEO-optimized with keywords and structure',
      'Consistent brand voice and quality',
    ],
    bestFor: [
      'Blog content creation',
      'Marketing copy and landing pages',
      'Educational content and guides',
    ],
  },

  'template-code-review': {
    templateId: 'template-code-review',
    useCase: 'Automated code review for pull requests and commits',
    sampleInput: {
      description: 'Code snippet or file to review',
      data: {
        code: `function processPayment(amount, userId) {
  const user = db.query('SELECT * FROM users WHERE id = ' + userId);
  if (user.balance >= amount) {
    db.query('UPDATE users SET balance = balance - ' + amount);
    return true;
  }
  return false;
}`,
        language: 'javascript',
        context: 'Payment processing function',
      },
    },
    expectedOutput: {
      description: 'Detailed code review with security, performance, and style feedback',
      example: `## Code Review: Payment Processing Function

### 🔴 Critical Issues (Must Fix)
1. **SQL Injection Vulnerability** - Line 2
   - Using string concatenation for SQL queries
   - **Fix:** Use parameterized queries
   \`\`\`javascript
   const user = db.query('SELECT * FROM users WHERE id = ?', [userId]);
   \`\`\`

2. **Race Condition** - Lines 3-4
   - No transaction wrapping, balance check and update not atomic
   - **Fix:** Use database transaction

### 🟡 Improvements (Should Fix)
1. **Error Handling** - Missing try/catch blocks
2. **Type Safety** - No input validation for amount/userId
3. **Logging** - No audit trail for payments

### ✅ Good Practices Found
- Clear function naming
- Simple, readable logic flow

### Recommended Refactor
[Complete secure implementation...]`,
    },
    benefits: [
      'Catches security vulnerabilities before production',
      'Enforces code quality and best practices',
      'Reduces review time by 60%',
    ],
    bestFor: [
      'Pull request reviews',
      'Legacy code audits',
      'Team code quality enforcement',
    ],
  },

  'template-data-processing': {
    templateId: 'template-data-processing',
    useCase: 'Process and transform data from multiple sources',
    sampleInput: {
      description: 'Raw data files or API responses to process',
      data: {
        dataSource: 'CSV file with customer records',
        operations: ['clean', 'deduplicate', 'enrich', 'format'],
        outputFormat: 'JSON',
      },
    },
    expectedOutput: {
      description: 'Clean, structured data ready for analysis or import',
      example: `{
  "summary": {
    "totalRecords": 1500,
    "duplicatesRemoved": 127,
    "errorsCorrected": 43,
    "enrichedFields": ["city", "state", "timezone"]
  },
  "data": [
    {
      "id": "CUST-001",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "+1-555-0123",
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105",
        "timezone": "America/Los_Angeles"
      },
      "status": "active",
      "lastPurchase": "2025-10-15"
    }
  ]
}`,
    },
    benefits: [
      'Automates 90% of manual data cleaning',
      'Reduces errors from manual processing',
      'Handles large datasets (10K+ records)',
    ],
    bestFor: [
      'Customer data migration',
      'ETL pipelines',
      'Data preparation for analytics',
    ],
  },

  'template-email-campaign': {
    templateId: 'template-email-campaign',
    useCase: 'Generate personalized email campaigns at scale',
    sampleInput: {
      description: 'Campaign goal, audience segments, and key messages',
      data: {
        campaignGoal: 'Product launch announcement',
        audienceSegments: ['existing customers', 'trial users', 'churned users'],
        productDetails: {
          name: 'Visual Workflow Builder',
          benefits: ['faster setup', 'no coding', 'drag-and-drop'],
        },
      },
    },
    expectedOutput: {
      description: 'Personalized email copy for each segment with A/B test variants',
      example: `## Segment: Existing Customers

**Subject Line A:** You asked, we built it: Visual Workflow Builder is here 🎨
**Subject Line B:** [Customer Name], design workflows in minutes (not hours)

**Email Body:**
Hi [FirstName],

Remember when you told us workflows were too complex to set up?

We listened. Today, we're thrilled to announce the Visual Workflow Builder - the feature you've been asking for.

**What's new:**
✨ Drag-and-drop workflow design
⚡ 10x faster setup (seriously)
🎯 No coding required

[CTA Button: Try It Now]

Your feedback shaped this. Let us know what you think.

Best,
The HUMMBL Team

P.S. Existing customers get 30 days free trial of premium features.`,
    },
    benefits: [
      'Generates 3-5 variants per segment automatically',
      'Personalized messaging increases open rates 40%',
      'Maintains consistent brand voice',
    ],
    bestFor: [
      'Product launches and announcements',
      'Re-engagement campaigns',
      'Onboarding email sequences',
    ],
  },

  'template-social-media': {
    templateId: 'template-social-media',
    useCase: 'Create engaging social media content across platforms',
    sampleInput: {
      description: 'Topic, platforms, and brand voice',
      data: {
        topic: 'Visual Workflow Builder launch',
        platforms: ['Twitter', 'LinkedIn', 'Facebook'],
        brandVoice: 'innovative, helpful, professional',
      },
    },
    expectedOutput: {
      description: 'Platform-optimized posts with hashtags and timing recommendations',
      example: `## Twitter Thread (5 tweets)

1/ 🚀 Big news: Visual Workflow Builder is LIVE

   Build AI workflows by dragging boxes. No code. No friction.
   
   We analyzed 100+ user requests and this was #1. Here's what we built: 🧵

2/ ⚡ Before: 15 min to create a workflow
   After: 2 min
   
   That's not incremental. That's transformational.

3/ [Screenshot of visual builder]

4/ Why it matters: Visual thinking = better workflows
   
   Seeing the connections helps you design smarter automation.

5/ Free for all users. Try it: [link]
   
   What will you build first? 👇

---

## LinkedIn Post

🎨 Visual Workflow Builder: From Concept to Production in 90 Days

We shipped the #1 requested feature by applying our own workflow automation to the development process...

[Professional tone, focus on business value]

---

## Best Times to Post
- Twitter: 3pm EST (high engagement window)
- LinkedIn: 8am EST (before work hours)
- Facebook: 7pm EST (evening browsing)`,
    },
    benefits: [
      'Optimized for each platform\'s best practices',
      'Saves 5-6 hours of content creation per week',
      'Maintains consistent messaging across channels',
    ],
    bestFor: [
      'Product announcements and launches',
      'Thought leadership content',
      'Brand awareness campaigns',
    ],
  },
};

/**
 * Get sample data for a specific template
 */
export const getTemplateSample = (templateId: string): TemplateSample | undefined => {
  return TEMPLATE_SAMPLES[templateId];
};

/**
 * Check if a template has sample data
 */
export const hasSampleData = (templateId: string): boolean => {
  return templateId in TEMPLATE_SAMPLES;
};
