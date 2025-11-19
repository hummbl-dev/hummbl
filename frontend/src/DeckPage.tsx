import type { FC } from 'react'
import './App.css'

export const DeckPage: FC = () => (
  <div className="page">
    <header className="hero">
      <a href="/" className="hero-back-link">
        Back to site
      </a>
      <h1 className="hero-title">HUMMBL Investor Overview</h1>
      <p className="hero-subtitle">
        A concise narrative version of the HUMMBL thesis, product, and roadmap for investors and early
        partners.
      </p>
    </header>
    <main className="page-main">
      <section className="page-section">
        <h2>What HUMMBL is</h2>
        <p>
          HUMMBL is a mental-model substrate for human–AI systems. Instead of another agent framework or
          prompt library, HUMMBL provides Base120 – a finite library of 120 rigorously defined mental models
          across six transformations (Perspective, Inversion, Composition, Decomposition, Recursion, and
          Systems). Each model has a stable code, such as DE7 or SY1, plus a definition, example, difficulty
          level, tags, and relationships, so humans and agents can share the same vocabulary of thinking
          moves.
        </p>
        <p>
          The core idea is to treat mental models as first-class infrastructure. We want the reasoning
          patterns your best people use in strategy, product, research, and operations to be addressable by
          code, referenced in documents and decision records, and reusable by agents. Base120 is deliberately
          finite and orthogonal so it can serve as a stable substrate that multiple tools and organizations
          can build on without coordination overhead exploding.
        </p>
      </section>

      <section className="page-section">
        <h2>The problem</h2>
        <p>
          Modern AI systems are excellent at generating answers but weak at exposing or reusing reasoning.
          Output is fluent, but the thinking that produces important decisions is invisible, inconsistent,
          and hard to audit. Each team and tool invents its own informal mental models and prompts, which
          makes it difficult to transfer good reasoning patterns across tools, time, or people. Even when a
          team discovers a powerful way to frame or decompose a problem, that insight often ends up locked in
          one-off prompts, slide decks, or tribal knowledge.
        </p>
        <p>
          As organizations lean harder on AI, this lack of shared reasoning substrate becomes the limiting
          factor. It leads to duplicated work, incoherent strategy across teams, and difficulty explaining or
          defending AI-assisted decisions to stakeholders. We believe there is a window to define a compact,
          interoperable reasoning substrate before hundreds of incompatible, ad hoc ones calcify.
        </p>
      </section>

      <section className="page-section">
        <h2>Why now</h2>
        <p>
          As foundation models become cheaper and more capable, raw model performance is commoditizing.
          Differentiation shifts from "who has the biggest model" to "who has the best reasoning substrate and
          playbooks". Today, many high-performing operators and teams already think in mental models, but the
          way they capture those models is informal and incompatible across organizations.
        </p>
        <p>
          At the same time, a new generation of AI-native tooling and agent frameworks is emerging. These
          systems need a way to describe and track reasoning patterns that is richer than free-form text but
          lighter-weight than full-on ontologies. HUMMBL aims to fill that gap with a simple, typed substrate
          that can slot into agent planning, logging, and governance without asking teams to abandon their
          existing tools. We expect this to show up in metrics investors care about: faster time-to-insight,
          more consistent decision quality across teams, and lower variance in outcomes when agents and new
          hires tackle complex work.
        </p>
        <p>
          In early design partnerships we will explicitly track targets such as percentage reductions in
          time-to-decision for complex workflows, improvements in success rates for agent-executed tasks, and
          shorter ramp times for new team members learning critical reasoning patterns. These are targets, not
          historical results, but they shape how we design integrations and experiments.
        </p>
      </section>

      <section className="page-section">
        <h2>How HUMMBL works</h2>
        <p>
          HUMMBL replaces giant, bespoke prompts with short sequences of model codes. Instead of a single
          opaque instruction block, workflows are expressed as sequences such as P1 → DE7 → SY1 → IN2: frame
          the problem, decompose with 80/20, identify leverage points, and run a premortem. Humans, tools,
          and agents all refer to the same sequences, making reasoning visible, reusable, and auditable.
        </p>
        <p>
          In practice, this looks like planners and playbooks that explicitly choose sequences for a given
          task – for example, one sequence for market-entry analysis, another for incident retrospectives, a
          third for experimental design. Agents execute these sequences step by step, logging both
          natural-language reasoning and the underlying HUMMBL codes, so future humans can understand and
          critique not just what the AI said but how it was thinking.
        </p>
      </section>

      <section className="page-section">
        <h2>Technical architecture (planned)</h2>
        <p>
          The Base120 API is implemented on Cloudflare Workers using Hono.js, with D1 (SQLite) as the source
          of truth and KV plus the Cache API for hot-path reads. A small /api/v1 surface exposes models,
          transformations, relationships, and search, giving agents and tools a low-latency reasoning
          substrate they can call without managing their own copies of the data. D1 uses prepared statements
          and FTS5 for search, while KV and Workers Cache handle the read-heavy hot paths.
        </p>
        <p>
          HUMMBL is also exposed as an MCP (Model Context Protocol) server today, which means compatible
          tools and agents can already discover and query Base120 using a standard protocol. Through the
          HUMMBL MCP server, clients can list models, fetch definitions, search by keyword, and retrieve
          recommended transformations without hard-coding API details. This makes it easier to plug HUMMBL
          into multi-agent systems and IDE-like environments that already speak MCP.
        </p>
      </section>

      <section className="page-section">
        <h2>Example API surface</h2>
        <p>
          Endpoints are intentionally small and predictable, designed to be easy to call from any language or
          framework. A typical integration will use a handful of endpoints for model lookups, search, and
          relationship discovery, rather than a sprawling API surface.
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
      </section>

      <section className="page-section">
        <h2>Case studies</h2>
        <h3>AI agent platform</h3>
        <p>
          Flows are named by HUMMBL sequences such as P1 → DE7 → SY1 → IN2. Planners pick sequences, agents
          log model codes alongside reasoning, and teams A/B test sequences instead of opaque prompts. Over
          time, the platform can learn which sequences perform better for different classes of tasks, and new
          agents can be assembled from proven reasoning patterns instead of starting from scratch. This
          creates the conditions for measurable improvements in task success rates and reduces the cost of
          bringing new agents or workflows online.
        </p>
        <h3>Product strategy and roadmapping</h3>
        <p>
          Strategy processes are encoded as small sets of Base120 sequences. Architecture decision records
          reference the models used in each decision, making reasoning easier to revisit and reuse. When new
          markets or features are considered, teams can reuse and refine the same sequences, rather than
          reinventing the reasoning process. This improves both decision quality and institutional memory, and
          it shortens the time needed for new leaders or teams to make decisions that are consistent with the
          organization’s best historical thinking.
        </p>
        <h3>Learning and onboarding</h3>
        <p>
          Onboarding teaches the sequences that matter most for the organization. Systems log which models
          appear in real decisions so gaps in the org’s reasoning portfolio can be measured and improved. As
          people work, usage data reveals which models and sequences are over- or under-used, informing
          targeted training and content development. Over time, this can translate into shorter ramp-up
          times for new hires and fewer costly mistakes driven by misaligned reasoning.
        </p>
      </section>

      <section className="page-section">
        <h2>Governance and overlays</h2>
        <ul className="bullets">
          <li>Base120 is the shared core; organizations define overlays such as ORG1 and ORG2.</li>
          <li>Overlays reference Base120 while adding domain-specific context, policy, and metrics.</li>
          <li>
            Governance and versioning keep overlays evolving without fragmenting the core substrate. Changes
            are tracked, and tools can always reference which version of a model or sequence was used in a
            given decision.
          </li>
        </ul>
      </section>

      <section className="page-section">
        <h2>Moat and defensibility</h2>
        <p>
          HUMMBL’s defensibility comes from a combination of a carefully designed core and the ecosystems that
          build on top of it. Base120 is intentionally finite, coherent, and opinionated; this makes it
          difficult to casually fork without losing interoperability benefits, but still flexible enough to
          support overlays and domain specializations. As organizations and tools adopt Base120, their
          overlays, data, and playbooks become naturally aligned with the core substrate.
        </p>
        <p>
          Over time, we expect moat to come from three sources: (1) the quality and stability of the Base120
          model set itself; (2) the density of integrations across agent frameworks, IDEs, and internal tools;
          and (3) the depth of organizational overlays and analytics built on HUMMBL. Together, these make it
          increasingly attractive to standardize on HUMMBL rather than inventing or migrating to a bespoke
          alternative.
        </p>
      </section>

      <section className="page-section">
        <h2>Go-to-market</h2>
        <p>
          Early go-to-market focuses on partnering with AI-native teams that feel the pain of fragmented
          reasoning most acutely: agent platform builders, complex product organizations, and learning or
          enablement teams. In these environments, we can embed HUMMBL into real workflows, quantify impact on
          decision quality and speed, and refine the substrate before broader rollout.
        </p>
        <p>
          From there, distribution expands through integrations and standards. Reference implementations for
          popular agent frameworks, IDE plugins, and the HUMMBL MCP server make it easy for developers to
          adopt Base120 by default. Over time, we expect many tools to offer HUMMBL support as a checkbox
          feature, in the same way that today they integrate standard identity or observability providers.
        </p>
      </section>

      <section className="page-section">
        <h2>Competitive landscape</h2>
        <p>
          HUMMBL lives alongside several adjacent efforts: mental-model books and courses, prompt libraries,
          agent orchestration frameworks, and domain-specific ontologies. Books and courses are valuable for
          human learning but are not programmable. Prompt libraries and agent frameworks provide important
          tooling, but they typically treat reasoning patterns as opaque text embedded in prompts. Ontologies
          can be expressive but are heavy to adopt and often domain-specific.
        </p>
        <p>
          HUMMBL’s differentiation is its focus on a small, typed, domain-agnostic substrate that is designed
          from day one to be shared between humans and agents. It is narrow enough to be adoptable, but
          general enough to underlie multiple products and organizations. Where other tools can come and go,
          our goal is for Base120 to be the stable reasoning layer they can all plug into.
        </p>
      </section>

      <section className="page-section">
        <h2>Roadmap and ask</h2>
        <ul className="bullets">
          <li>
            Phase 0: stabilize Base120, documentation, and early case studies with partners, targeting initial
            adoption and validation in real AI-native workflows.
          </li>
          <li>
            Phase 1: harden the public API, TypeScript client, and HUMMBL MCP server, and build reference
            integrations for popular agent frameworks and tooling ecosystems.
          </li>
          <li>
            Phase 2+: support organization-specific overlays, analytics, and multi-agent protocols built on
            HUMMBL as a shared substrate, moving toward de facto standards.
          </li>
          <li>
            We are seeking early design partners and capital to harden the substrate, build flagship
            integrations, and demonstrate clear lift in decision quality, agent performance, and onboarding
            speed. The long-term opportunity is to become a default reasoning substrate for serious AI-native
            organizations and platforms, with value accruing as more tools and teams standardize on Base120.
          </li>
        </ul>
        <p>
          Current status: HUMMBL is in Phase 0 (pre-revenue), focused on finalizing the Base120 model
          library, building out the API and MCP server, and working with a small set of prospective design
          partners. The immediate priority is to prove that a shared reasoning substrate can deliver material
          improvements in key metrics for a handful of high-leverage use cases.
        </p>
        <p>
          If you would like to explore partnering or investing, you can reach us via the early access form on
          the main site. Use the "Get early access" section at{' '}
          <a href="/#contact" className="footer-link">
            hummbl.io
          </a>{' '}
          and mention that you are reaching out in an investor or design-partner capacity.
        </p>
      </section>
    </main>
  </div>
)
