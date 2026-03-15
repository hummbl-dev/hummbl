# HUMMBL — Structured Reasoning for AI Agents

## The Gap

Every agent framework today solves orchestration: how to chain LLM calls, route between tools, manage state. LangGraph, CrewAI, AutoGen — they all answer "what should the agent do next?"

None of them answer "how should the agent think?"

The reasoning layer is invisible. When an agent runs a 98-experiment autoresearch loop and improves val_bpb by 8.5%, the reasoning that drove those decisions — which hypotheses were formed, which were abandoned, what was learned from failures — exists only as implicit patterns in git history and log files. It is not captured, not inspectable, not reusable.

HUMMBL fills this gap. It is a structured reasoning engine: composable reasoning protocols, inspectable traces, and domain-specific patterns that make agent cognition explicit.

## How It Connects

### Autoresearch: The Prototype

The autoresearch experiment loop is the founding example of HUMMBL-style reasoning. Each experiment cycle follows the scientific method protocol:

1. **Hypothesis** — "Increasing depth from 8 to 10 should lower val_bpb because more layers capture more complex patterns"
2. **Action** — Modify train.py, commit
3. **Action** — Run the experiment (5 minutes, fixed budget)
4. **Observation** — val_bpb=0.821, peak_vram=6.1 GB
5. **Evaluation** — "0.016 improvement over baseline, within VRAM budget"
6. **Decision** — Keep (advance the branch)
7. **Reflection** — "Depth helps. Try 12 next, but watch VRAM."

This is already structured reasoning — HUMMBL makes it explicit and capturable. The `AutoresearchCapture` module converts results.tsv into formal reasoning traces, retroactively.

### Peptide Checker: First Application

Peptide quality assessment is a different domain but the same pattern: observe data, evaluate against standards, hypothesize causes, decide. The `QualityAssessment` protocol formalizes this. When an agent evaluates a peptide test result, its reasoning trace is captured, inspectable, and auditable — critical for a consumer health product.

## Competitive Landscape

| Framework | What it solves | What it misses |
|-----------|---------------|----------------|
| LangChain/LangGraph | Tool orchestration, state machines | No reasoning structure |
| AutoGen | Multi-agent conversation | Reasoning is implicit in chat |
| CrewAI | Role-based agent teams | No formal reasoning protocols |
| DSPy | Prompt optimization | Optimizes outputs, not reasoning |
| **HUMMBL** | **Structured reasoning** | **Composable protocols, inspectable traces** |

HUMMBL is not a competitor to these frameworks — it is a layer that sits beneath or beside them. A LangGraph agent can use HUMMBL protocols to structure its reasoning. A CrewAI team can capture HUMMBL traces for inspection.

## The Product

### Core Components

1. **Reasoning Engine** (`reasoning.py`)
   - Data structures: `ReasoningStep`, `ReasoningTrace`
   - Topologies: chain (linear), tree (branching), graph (networked)
   - Step types: hypothesis, action, observation, evaluation, decision, reflection
   - Full serialization to/from JSON for persistence and transport

2. **Protocols** (`protocols.py`)
   - `ReasoningProtocol` — base class for defining reasoning patterns
   - `ScientificMethod` — the autoresearch experiment loop
   - `QualityAssessment` — peptide quality evaluation
   - `HypothesisExploration` — tree-of-thought branching
   - Validation: check that a trace follows its protocol
   - Composability: protocols can be chained and nested

3. **Capture** (`capture.py`)
   - `AutoresearchCapture` — converts results.tsv and strategy.md into traces
   - Retroactive capture: derive reasoning structure from existing artifacts
   - Summary statistics: keep/discard rates, best metrics, experiment counts

### Design Principles

- **Reasoning is data.** Traces are first-class objects that can be serialized, queried, compared, and learned from.
- **Protocols are templates, not constraints.** They guide reasoning but don't prevent creative deviation.
- **Capture should be retroactive.** Agents should not need to call a special API while reasoning. HUMMBL extracts structure from natural artifacts.
- **Simplicity wins.** The core data model is three things: steps, traces, and protocols. Everything else is built on top.

### Roadmap

- **v0.1** (current): Core data model, built-in protocols, autoresearch capture
- **v0.2**: Trace visualization (terminal and web), trace diff/comparison
- **v0.3**: Live capture (middleware for agent frameworks), trace-guided planning
- **v0.4**: Learning from traces — pattern extraction, protocol recommendation
- **v1.0**: Production API, multi-agent trace coordination, trace marketplace
