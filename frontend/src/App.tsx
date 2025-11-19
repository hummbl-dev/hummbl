import type { FC, FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import './App.css'

interface SectionProps {
  id: string
  children: ReactNode
}

const NavBar: FC = () => (
  <header className="nav">
    <div className="nav-inner">
      <div className="nav-logo">HUMMBL</div>
      <nav className="nav-links" aria-label="Primary">
        <a href="#problem">Problem</a>
        <a href="#what-is-hummbl">What</a>
        <a href="#how-it-works">How</a>
        <a href="#examples">Examples</a>
        <a href="#api-status">API</a>
        <a href="#roadmap">Roadmap</a>
        <a href="/deck">Deck</a>
      </nav>
    </div>
  </header>
)

const PageSection: FC<SectionProps> = ({ id, children }) => (
  <section id={id} className="page-section">
    {children}
  </section>
)

const HeroSection: FC = () => (
  <header className="hero">
    <div className="status-badge" aria-label="Current status">
      Current status: Phase 0 – pre-revenue, design partners wanted
    </div>
    <h1 className="hero-title">HUMMBL</h1>
    <p className="hero-tagline">Reasoning infrastructure for human–AI systems.</p>
    <p className="hero-subtitle">
      Base120 is a finite library of 120 mental models across 6 transformations that lets humans, tools,
      and AI agents share the same reasoning substrate.
    </p>
    <div className="hero-actions">
      <a href="#contact" className="primary-cta">
        Get early access
      </a>
      <a href="/whitepaper" className="secondary-cta">
        Read the full paper
      </a>
    </div>
  </header>
)

const ProblemSection: FC = () => (
  <PageSection id="problem">
    <h2>AI is great at answers. It's bad at reasoning.</h2>
    <p>
      Current AI systems generate impressive text, but the thinking behind decisions is often invisible,
      inconsistent, and hard to trace. Organizations end up with fragile prompts, duplicated work, and
      strategy that does not transfer across teams or tools.
    </p>
  </PageSection>
)

const WhatIsHummblSection: FC = () => (
  <PageSection id="what-is-hummbl">
    <h2>HUMMBL is a mental–model substrate for your org and your agents.</h2>
    <p>
      HUMMBL encodes 120 rigorously defined mental models into a programmable library called Base120,
      organized into six transformations so humans, tools, and AI agents can share the same reasoning
      vocabulary.
    </p>
    <ul className="transformations-list">
      <li>
        <strong>P – Perspective</strong> – Frame, name, and shift point of view.
      </li>
      <li>
        <strong>IN – Inversion</strong> – Reverse assumptions and work backwards.
      </li>
      <li>
        <strong>CO – Composition</strong> – Combine parts into coherent wholes.
      </li>
      <li>
        <strong>DE – Decomposition</strong> – Break down complexity into drivers.
      </li>
      <li>
        <strong>RE – Recursion</strong> – Iterate, learn, and improve over time.
      </li>
      <li>
        <strong>SY – Systems</strong> – Understand leverage, boundaries, and emergence.
      </li>
    </ul>
  </PageSection>
)

const HowItWorksSection: FC = () => (
  <PageSection id="how-it-works">
    <h2>From prompt lore to reasoning infrastructure.</h2>
    <p>
      With HUMMBL, you move beyond ad–hoc prompts to a shared, programmable vocabulary of thinking moves.
      Each mental model has a stable code, precise definition, examples, and relationships that agents and
      humans can both use.
    </p>
    <ul className="bullets">
      <li>Make reasoning reusable instead of rewriting prompts from scratch.</li>
      <li>Align humans and agents with the same vocabulary for analysis and decision making.</li>
      <li>Trace important decisions back to the sequences of models used.</li>
    </ul>
  </PageSection>
)

const ExamplesSection: FC = () => (
  <PageSection id="examples">
    <h2>What you can build with HUMMBL.</h2>
    <ul className="bullets">
      <li>
        Product strategy playbooks encoded as sequences such as P1 – DE7 – SY1 – IN2 instead of opaque
        checklists.
      </li>
      <li>
        Agent orchestration that routes steps by transformation – DE for analysis, CO for synthesis, RE
        for refinement.
      </li>
      <li>
        Learning and onboarding that teaches how your organization thinks, not just which tools it uses.
      </li>
    </ul>
    <h3>Example scenario: agent planning with HUMMBL</h3>
    <p>
      A planning agent receives a high-level task like &quot;evaluate a new market entry.&quot; Instead of running a
      single opaque prompt, it chooses a HUMMBL sequence such as P1 → DE7 → SY1 → IN2, executing each step
      with the appropriate tools and logging the model codes alongside natural-language reasoning.
    </p>
  </PageSection>
)

const RoadmapSection: FC = () => (
  <PageSection id="roadmap">
    <h2>Roadmap.</h2>
    <ul className="bullets">
      <li>
        <strong>Phase 0 – Commercialization</strong> – Stabilize Base120 and validate high–value case
        studies with early partners.
      </li>
      <li>
        <strong>Phase 1 – Public API</strong> – Ship /api/v1 on Cloudflare Workers with D1, KV, and
        edge caching, plus a typed client and examples.
      </li>
      <li>
        <strong>Phase 2+ – Org substrates</strong> – Support org–specific overlays, analytics, and
        multi–agent protocols on top of HUMMBL.
      </li>
    </ul>
  </PageSection>
)

const CallToActionSection: FC = () => (
  <PageSection id="cta">
    <h2>Help define the reasoning substrate for human–AI systems.</h2>
    <p>
      HUMMBL is working closely with a small group of early partners who are building serious
      AI–enabled systems and care about how reasoning works, not just how text looks.
    </p>
    <div className="hero-actions">
      <a href="#contact" className="primary-cta">
        Request early access
      </a>
    </div>
  </PageSection>
)

const ContactSection: FC = () => {
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email so we can reach you.')
      return
    }
    setError(null)
    setSubmitting(true)
    setSubmitted(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message, source: 'landing' }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setSubmitted(true)
      setEmail('')
      setMessage('')
    } catch {
      const params = new URLSearchParams({
        subject: 'HUMMBL Early Access',
        body: `Email: ${email || '(not provided)'}\n\nMessage:\n${message || '(none)'}`,
      })
      window.location.href = `mailto:hello@hummbl.io?${params.toString()}`
      setError('We attempted to contact the backend and fell back to email. You can also reach us directly at hello@hummbl.io.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageSection id="contact">
      <h2>Get early access.</h2>
      <p>
        Share your email and a short description of your stack or use case. We&apos;re working closely with a
        small number of partners who are building serious AI-enabled systems and care about how reasoning
        works, not just how text looks.
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-grid">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-input"
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'contact-email-error' : undefined}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span className="field-label">Context (optional)</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="field-input field-input-textarea"
              placeholder="Briefly describe your stack, use case, or interest (for example: investor, design partner, agent platform, product team)."
              rows={4}
            />
          </label>
        </div>
        {error && (
          <p id="contact-email-error" className="field-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primary-cta contact-submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send request'}
        </button>
      </form>
      <p className="privacy-note">
        We&apos;ll use your email and context only to follow up about HUMMBL. No spam, no resale of data.
      </p>
      {submitted && !error && (
        <p className="success-note" role="status">
          Thanks for reaching out. We&apos;ll get back to you shortly.
        </p>
      )}
    </PageSection>
  )
}

const WhitepaperSection: FC = () => (
  <PageSection id="whitepaper">
    <h2>Deep dive.</h2>
    <h3>For investors and early adopters</h3>
    <p>
      HUMMBL is building a mental-model substrate for human–AI systems. Instead of another agent framework
      or prompt library, we provide a finite, programmable library of 120 mental models (Base120) that lets
      humans, tools, and AI agents share the same vocabulary for how reasoning works.
    </p>
    <p>
      The thesis is simple: as AI gets cheaper and more capable, differentiation shifts from &quot;who has the
      biggest model&quot; to &quot;who has the best reasoning substrate and playbooks&quot;. Base120 is designed to be that
      substrate—small enough to learn, expressive enough to cover real strategy, product, and research work,
      and stable enough to build tooling and standards on top of.
    </p>
    <h3>Why now</h3>
    <p>
      Organizations are already improvising their own mental-model lists and prompt patterns, but they are
      fragmented, informal, and hard to reuse. Agent platforms are emerging without a shared, typed way to
      describe reasoning. HUMMBL targets this gap by offering a neutral, API-first substrate that can plug
      into many tools and frameworks.
    </p>
    <h3>What the full paper covers</h3>
    <ul className="bullets">
      <li>The problem: why current AI is answer-centric rather than reasoning-centric.</li>
      <li>
        The HUMMBL solution: Base120, the six transformations, and how model sequences replace brittle
        prompt blobs.
      </li>
      <li>
        Architecture: Cloudflare Workers + D1 + KV + Cache API, and a small /api/v1 surface for agents and
        tools.
      </li>
      <li>
        Case studies: AI agent platforms, product strategy and roadmapping, and learning/onboarding built on
        HUMMBL.
      </li>
      <li>
        Governance and overlays: how organizations extend Base120 with their own models without fragmenting
        the core substrate.
      </li>
      <li>
        Roadmap: from Base120 stabilization and early partners to a broader ecosystem and emerging
        standards.
      </li>
    </ul>
  </PageSection>
)

const ApiStatusSection: FC = () => (
  <PageSection id="api-status">
    <h2>API status.</h2>
    <p>
      The HUMMBL API is in active development. Phase 1 focuses on a public, read-heavy /api/v1 surface on
      Cloudflare Workers with D1, KV, and edge caching. Early partners are onboarding now; broader access
      will be announced as the Base120 models and endpoints stabilize.
    </p>
    <p>
      In production, this section will summarize uptime, rate limits, and any active incidents. We also
      disclose high-level telemetry and analytics usage here so integrators understand how requests are
      observed and protected.
    </p>
    <p>
      Base120 is also available today via the HUMMBL MCP (Model Context Protocol) server, so compatible
      tools and agents can discover and query models using a standard protocol without hard-coding API
      details.
    </p>
    <p>
      For deployments using the HUMMBL Workers backend, a simple <code>/api/health</code> endpoint returns
      a JSON health payload, for example:
    </p>
    <pre>{`
GET /api/health

{
  "ok": true,
  "service": "hummbl-contact",
  "version": "0.1.0"
}
    `}</pre>
    <div className="api-heading-row">
      <h3>Sample API response</h3>
      <span className="api-copy-hint" aria-hidden="true">
        Copy
      </span>
    </div>
    <p>
      The API is designed to be small and predictable. For example, a single model fetch might look like
      this:
    </p>
    <pre>{`
GET /api/v1/models/DE7

{
  "code": "DE7",
  "name": "Pareto Decomposition (80/20)",
  "transformation": "DE",
  "description": "Identify the vital few drivers that produce most of the impact.",
  "example": "20% of features generate 80% of usage; focus analysis on these first.",
  "tags": ["decomposition", "prioritization", "leverage"],
  "difficulty": "beginner",
  "relatedModels": ["SY1", "P1"],
  "version": "1.0.0",
  "createdAt": "2025-10-29T00:00:00.000Z",
  "updatedAt": "2025-10-29T00:00:00.000Z"
}
    `}</pre>
    <p>
      Search returns a lightweight, ranked list suitable for autocomplete and planning:
    </p>
    <pre>{`
GET /api/v1/search?q=decomposition

{
  "query": "decomposition",
  "results": [
    { "code": "DE1", "name": "Root Cause Analysis (5 Whys)", "transformation": "DE", "score": 0.98 },
    { "code": "DE7", "name": "Pareto Decomposition (80/20)", "transformation": "DE", "score": 0.91 }
  ]
}
    `}</pre>
  </PageSection>
)

const Footer: FC = () => (
  <footer className="footer">
    <p className="footer-text">
      HUMMBL Systems · Base120 mental models for human–AI systems · {new Date().getFullYear()} ·{' '}
      <a href="/whitepaper" className="footer-link">
        Full paper
      </a>{' '}
      ·{' '}
      <a href="#api-status" className="footer-link">
        API status
      </a>{' '}
      ·{' '}
      <a href="/deck" className="footer-link">
        Investor deck
      </a>
    </p>
  </footer>
)

export const App: FC = () => (
  <div className="page">
    <NavBar />
    <HeroSection />
    <main className="page-main">
      <ProblemSection />
      <WhatIsHummblSection />
      <HowItWorksSection />
      <ExamplesSection />
      <RoadmapSection />
      <CallToActionSection />
      <WhitepaperSection />
      <ApiStatusSection />
      <ContactSection />
    </main>
    <Footer />
  </div>
)
