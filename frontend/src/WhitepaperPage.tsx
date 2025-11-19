import type { FC } from 'react'
import './App.css'

export const WhitepaperPage: FC = () => (
  <div className="page">
    <header className="hero">
      <a href="/" className="hero-back-link">
        ← Back to site
      </a>
      <h1 className="hero-title">HUMMBL Whitepaper</h1>
      <p className="hero-subtitle">
        A mental-model substrate for human–AI systems built on Base120: 120 mental models across six
        transformations.
      </p>
    </header>
    <main className="page-main">
      <section className="page-section">
        <h2>1. Abstract</h2>
        <p>
          Most AI systems today optimize for answers, not thinking. They generate plausible text but do not
          expose or reuse the reasoning structures that underlie good decisions: how problems are framed,
          decomposed, inverted, recomposed, and iterated over time.
        </p>
        <p>
          HUMMBL is a mental-model substrate for human–AI systems. At its core is Base120, a compact library
          of 120 named mental models organized into six transformations: Perspective (P), Inversion (IN),
          Composition (CO), Decomposition (DE), Recursion (RE), and Systems (SY). Each model is addressable,
          documented, and ready for programmatic use by humans and agents.
        </p>
      </section>

      <section className="page-section">
        <h2>2. The problem: reasoning is a missing primitive</h2>
        <p>
          Current AI systems are excellent at synthesis and search but weak at reusable reasoning,
          coordination, and traceability. Reasoning patterns are rarely named, logged, or reused. Across an
          organization, this leads to repeated rediscovery, inconsistent strategy, and overreliance on brittle
          prompt lore.
        </p>
      </section>

      <section className="page-section">
        <h2>3. HUMMBL Base120</h2>
        <p>
          Base120 is designed as a minimal, interoperable standard for mental models. It is finite (exactly
          120 models), orthogonal (organized by transformation rather than domain), composable, and
          programmable.
        </p>
        <ul className="bullets">
          <li>Perspective (P): framing, naming, and shifting point of view.</li>
          <li>Inversion (IN): reversing assumptions and working backward.</li>
          <li>Composition (CO): building up, combining, and integrating parts into wholes.</li>
          <li>Decomposition (DE): breaking problems into parts and drivers.</li>
          <li>Recursion (RE): iteration, feedback, and continuous improvement.</li>
          <li>Systems (SY): meta-systems, leverage, boundaries, and emergence.</li>
        </ul>
      </section>

      <section className="page-section">
        <h2>4. HUMMBL as infrastructure</h2>
        <p>
          HUMMBL provides a shared vocabulary of thinking moves for humans and agents. Humans can reference
          specific models in documents and decisions, while agents can plan and log work as sequences of
          model codes, such as P1 → DE7 → SY1 → IN2.
        </p>
        <p>
          Instead of encoding complex patterns as large, fragile prompts, HUMMBL encourages named moves and
          reusable sequences, making reasoning visible, auditable, and composable across tools.
        </p>
      </section>

      <section className="page-section">
        <h2>5. Case studies</h2>
        <h3>5.1 AI agent platform</h3>
        <p>
          Consider an AI agent platform that orchestrates tools for research, planning, and execution.
          Without HUMMBL, each agent and prompt designer tends to invent their own informal reasoning
          patterns: one workflow uses a long checklist, another uses a different set of analysis steps, and
          few of these patterns are named, logged, or reused across teams.
        </p>
        <p>
          In this environment, reasoning has three consistent problems. First, it is fragile: small prompt
          changes can silently change how the system "thinks". Second, it is opaque: downstream users see
          only the final answer, not the thinking moves that produced it. Third, it is hard to improve:
          teams optimize prompts for local wins rather than evolving a shared reasoning substrate.
        </p>
        <p>
          With HUMMBL integrated, the platform introduces a thin reasoning layer based on Base120. Instead of
          naming flows after prompts, they are named after sequences of mental models – for example,
          P1 → DE7 → SY1 → IN2 for a market-entry strategy analysis, or DE1 → CO2 → RE1 for a debugging
          workflow.
        </p>
        <p>
          At planning time, the agent planner selects an appropriate sequence of models given a task. At
          execution time, each step in the plan is annotated with the corresponding HUMMBL code. At logging
          time, traces include both natural-language reasoning and the model sequence that guided it. Over
          time, the platform can analyze which sequences lead to better outcomes for different classes of
          problems.
        </p>
        <p>
          This shifts the locus of improvement. Rather than endlessly tweaking unstructured prompts, the
          platform team iterates on HUMMBL sequences themselves – for example, comparing two competing
          decompositions of a new product problem, or testing whether adding an Inversion step (IN2,
          premortem analysis) systematically reduces downstream failures.
        </p>
        <p>
          The result is a more coherent agent ecosystem. New agents are assembled from known, named reasoning
          patterns instead of reinventing workflows from scratch. Human operators can understand, critique,
          and refine agent behavior in terms of mental models they also use directly. And because Base120 is
          finite and versioned, improvements to reasoning patterns compound across the entire platform
          instead of remaining trapped in isolated prompts.
        </p>

        <h3>5.2 Product strategy and roadmapping</h3>
        <p>
          A product team planning a new capability – for example, a developer-facing API – faces a blend of
          market analysis, technical constraints, and organizational alignment. Without a common reasoning
          substrate, each planning cycle becomes a bespoke mix of slide templates, frameworks, and personal
          heuristics that are difficult to compare or reuse.
        </p>
        <p>
          With HUMMBL, the team encodes its strategy process as a small set of Base120 sequences. A typical
          path might be P1 → DE7 → SY1 → IN2: framing the problem and target segment (P), decomposing impact
          using 80/20 analysis (DE7), identifying leverage points in the broader system (SY1), and running a
          premortem on the proposed plan (IN2).
        </p>
        <p>
          Concretely, this shows up in artifacts. Strategy memos and architecture decision records reference
          the HUMMBL codes used in each section. When someone revisits an ADR six months later, they can see
          not only the final decision but the model sequence that shaped it, making it easier to critique,
          extend, or reuse for adjacent decisions.
        </p>
        <p>
          Over time, the organization can compare how different sequences perform: for example, whether
          product bets that incorporate an explicit Systems step (SY models) correlate with fewer downstream
          surprises, or whether adding Recursion models (RE1, iterative refinement) leads to better outcomes
          in fast-moving markets.
        </p>

        <h3>5.3 Learning and onboarding</h3>
        <p>
          New team members often struggle to internalize not just what a company does, but how it thinks.
          Playbooks, if they exist, are scattered across documents and tools with inconsistent depth and
          language.
        </p>
        <p>
          With HUMMBL, onboarding explicitly teaches Base120 sequences that matter most for the
          organization – for example, the standard way to analyze incidents, evaluate partnerships, or design
          experiments. Internal learning materials walk through concrete scenarios while calling out the
          underlying models, such as DE1 for root cause analysis or SY2 for setting system boundaries.
        </p>
        <p>
          As people work, the systems they use can log which models show up in their decisions and project
          artifacts. This makes it possible to identify gaps – teams overusing certain patterns, or rarely
          applying others – and to design targeted learning experiences that strengthen the organization’s
          reasoning portfolio over time.
        </p>
      </section>

      <section className="page-section">
        <h2>6. Governance and organization-specific overlays</h2>
        <p>
          Base120 is designed as a shared substrate, not a rigid straitjacket. Most organizations will need
          their own extensions – models that reflect domain-specific patterns, internal language, and
          regulatory or operational constraints.
        </p>
        <p>
          HUMMBL anticipates this through overlays: organizations can define additional models (for example,
          ORG1, ORG2, and so on) that explicitly reference Base120 models. An overlay model might combine a
          standard HUMMBL sequence with company-specific constraints or metrics, while remaining compatible
          with the shared substrate.
        </p>
        <p>
          Governance focuses on who can introduce, modify, or deprecate these overlays and how those changes
          propagate. In practice, this means lightweight change-control processes, versioning for overlay
          models, and explicit links from internal playbooks and tools back to the underlying HUMMBL
          definitions they extend.
        </p>
        <p>
          Over time, this makes it possible to separate durable reasoning patterns (captured in Base120) from
          organization-specific policy and context (captured in overlays). Teams can evolve their overlays
          without fragmenting the core vocabulary that allows humans and agents to collaborate across tools
          and boundaries.
        </p>
      </section>

      <section className="page-section">
        <h2>7. Technical architecture</h2>
        <p>
          The planned API is implemented on Cloudflare Workers using Hono.js, D1 (SQLite), KV, R2, and the
          Cache API. A small, typed /api/v1 surface exposes models, transformations, relationships, and
          search, with KV and edge caching in front of D1 for low-latency, read-heavy workloads.
        </p>
        <p>At a high level, the core endpoints are:</p>
        <ul className="bullets">
          <li>
            <code>GET /api/v1/models</code> – list all Base120 models with basic metadata.
          </li>
          <li>
            <code>GET /api/v1/models/:code</code> – retrieve a specific model such as DE7 or SY1.
          </li>
          <li>
            <code>GET /api/v1/search</code> – search by keyword, tags, or transformation.
          </li>
          <li>
            <code>GET /api/v1/transformations</code> – list the six transformations and their models.
          </li>
          <li>
            <code>GET /api/v1/relationships</code> – explore related models and recommended sequences.
          </li>
        </ul>
        <p>A single model response is intentionally compact and stable. For example:</p>
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
          Search responses include a ranked list of models along with basic scoring information, suitable for
          powering autocomplete and agent planning. For example:
        </p>
        <pre>{`
GET /api/v1/search?q=decomposition

{
  "query": "decomposition",
  "results": [
    {
      "code": "DE1",
      "name": "Root Cause Analysis (5 Whys)",
      "transformation": "DE",
      "score": 0.98
    },
    {
      "code": "DE7",
      "name": "Pareto Decomposition (80/20)",
      "transformation": "DE",
      "score": 0.91
    }
  ]
}
        `}</pre>
        <p>
          Internally, D1 acts as the source of truth with prepared statements and FTS5 indexes, while KV and
          the Cache API handle hot-path reads. This allows agents and tools to treat HUMMBL as a low-latency
          reasoning substrate without managing their own copies of Base120.
        </p>
        <p>
          Security and reliability follow a simple, explicit model. All data access goes through prepared
          statements, and the public API is read-only in its initial phases. Rate limiting is enforced at the
          edge, with per-IP quotas designed to support heavy read workloads from agents without exposing the
          service to abuse.
        </p>
        <p>Operationally, the platform emphasizes observability and versioning:</p>
        <ul className="bullets">
          <li>
            Metrics and logs capture latency, cache hit rates, error rates, and endpoint usage by class of
            client.
          </li>
          <li>
            Semantic versioning is applied to both the Base120 dataset and the public API, with clear
            deprecation windows and migration notes.
          </li>
          <li>
            Changes to individual models are tracked over time so organizations can audit how definitions
            evolved and which sequences were in use at any given point.
          </li>
        </ul>
      </section>

      <section className="page-section">
        <h2>8. Roadmap</h2>
        <ul className="bullets">
          <li>Phase 0: stabilize Base120, documentation, and early case studies with partners.</li>
          <li>Phase 1: ship the public API, TypeScript client, and reference integrations.</li>
          <li>
            Phase 2+: support organization-specific model overlays, analytics, and multi-agent protocols
            built on HUMMBL as a shared substrate.
          </li>
        </ul>
        <p>
          Across all phases, the guiding priority is to keep HUMMBL small, stable, and interoperable. Rather
          than chasing every possible feature, the roadmap focuses on hardening the Base120 substrate,
          encoding high-value reasoning patterns, and making it easy for other systems to build on top.
        </p>
        <p>
          In practical terms, this means collaborating with a small number of partners in demanding
          environments—agent platforms, complex product organizations, and learning systems—and letting those
          use cases shape which parts of the model library, API, and governance features mature first.
        </p>
      </section>

      <section className="page-section">
        <h2>9. Related work</h2>
        <p>
          HUMMBL is also exposed as an MCP (Model Context Protocol) server, which is already available for
          compatible tools and agents to use. Through the HUMMBL MCP server, clients can discover and query
          Base120 using a standard protocol, list models, fetch definitions, search by keyword, and retrieve
          recommended transformations without hard-coding API details. This makes it easier to plug HUMMBL
          into multi-agent systems and IDE-like environments that already speak MCP.
        </p>
        <p>
          Prompt libraries and agent frameworks, on the other hand, provide composable building blocks for
          working with large language models but typically treat reasoning patterns as unstructured text
          embedded in prompts. This makes it difficult to share, analyze, or evolve those patterns across
          tools and teams.
        </p>
        <p>
          HUMMBL’s contribution is to treat mental models as first-class infrastructure: a finite, versioned
          substrate that can underlie many tools, prompts, and agents. It is not a replacement for agent
          frameworks or orchestration layers, but a shared vocabulary that they can use to express and track
          how reasoning actually happens.
        </p>
      </section>

      <section className="page-section">
        <h2>10. Definitions and glossary</h2>
        <p>
          This appendix summarizes core terms used throughout the whitepaper.
        </p>
        <ul className="bullets">
          <li>
            <strong>Base120</strong> – the HUMMBL library of 120 named mental models, each assigned to one of
            six transformations (P, IN, CO, DE, RE, SY).
          </li>
          <li>
            <strong>Transformation</strong> – a category of thinking move: Perspective (P), Inversion (IN),
            Composition (CO), Decomposition (DE), Recursion (RE), or Systems (SY).
          </li>
          <li>
            <strong>Model code</strong> – a stable identifier like DE7 or SY1 that uniquely names a mental
            model within Base120.
          </li>
          <li>
            <strong>Sequence</strong> – an ordered set of model codes (for example, P1 → DE7 → SY1 → IN2) used
            to describe a reusable reasoning pattern or playbook.
          </li>
          <li>
            <strong>Overlay</strong> – an organization-specific model that explicitly references one or more
            Base120 models while adding local context, policy, or constraints (for example, ORG1).
          </li>
          <li>
            <strong>Reasoning substrate</strong> – the combination of Base120, overlays, and supporting
            infrastructure that allows humans and agents to share, log, and analyze reasoning patterns across
            tools and time.
          </li>
        </ul>
      </section>
    </main>
  </div>
)
