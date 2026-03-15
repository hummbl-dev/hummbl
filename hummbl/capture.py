"""Reasoning trace capture from autoresearch experiment data.

Converts the artifacts of an autoresearch run — results.tsv and
strategy notes — into structured HUMMBL reasoning traces. This is
the bridge between "an agent did stuff" and "we have an inspectable
record of how it reasoned."

This module demonstrates a core HUMMBL principle: reasoning traces
should be derivable from existing artifacts, not require agents to
use a special API during execution. Capture after the fact, then
use the traces for analysis and learning.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Optional

from hummbl.reasoning import (
    ReasoningStep,
    ReasoningTopology,
    ReasoningTrace,
    StepType,
    make_step,
    make_trace,
)


class AutoresearchCapture:
    """Captures reasoning traces from autoresearch experiment loops.

    Each row in results.tsv represents one experiment cycle:
    hypothesis (description) -> action (code change via commit) ->
    observation (val_bpb, memory) -> decision (keep/discard/crash).

    The capture reconstructs these steps and links them into traces.
    """

    def capture_from_results_tsv(
        self, path: str | Path
    ) -> list[ReasoningTrace]:
        """Convert results.tsv history into structured reasoning traces.

        Each row becomes one trace with the following steps:
        1. HYPOTHESIS — inferred from the description column
        2. ACTION — the code change (commit hash as metadata)
        3. OBSERVATION — val_bpb and memory usage
        4. EVALUATION — comparison to the running best
        5. DECISION — keep, discard, or crash

        Args:
            path: Path to the results.tsv file.

        Returns:
            List of ReasoningTrace objects, one per experiment row.
        """
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"results.tsv not found: {path}")

        traces: list[ReasoningTrace] = []
        best_bpb: Optional[float] = None

        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row_num, row in enumerate(reader):
                trace = self._row_to_trace(row, row_num, best_bpb)
                traces.append(trace)

                # Track the running best for evaluation context
                val_bpb = self._parse_float(row.get("val_bpb", "0"))
                status = row.get("status", "").strip()
                if status == "keep" and val_bpb > 0:
                    if best_bpb is None or val_bpb < best_bpb:
                        best_bpb = val_bpb

        return traces

    def _row_to_trace(
        self,
        row: dict,
        experiment_num: int,
        best_bpb: Optional[float],
    ) -> ReasoningTrace:
        """Convert a single results.tsv row into a reasoning trace."""
        commit = row.get("commit", "unknown").strip()
        val_bpb = self._parse_float(row.get("val_bpb", "0"))
        memory_gb = self._parse_float(row.get("memory_gb", "0"))
        status = row.get("status", "unknown").strip()
        description = row.get("description", "").strip()

        trace = make_trace(
            domain="autoresearch",
            topology=ReasoningTopology.CHAIN,
            tags=[f"experiment_{experiment_num}", status],
        )

        # Step 1: HYPOTHESIS — what did the researcher expect?
        hypothesis = make_step(
            StepType.HYPOTHESIS,
            content=f"Experiment {experiment_num}: {description}",
            metadata={"experiment_num": experiment_num},
        )
        trace.add_step(hypothesis)

        # Step 2: ACTION — the code change
        action = make_step(
            StepType.ACTION,
            content=f"Modified train.py and committed as {commit}",
            parent_id=hypothesis.id,
            metadata={"commit_hash": commit},
        )
        trace.add_step(action)

        # Step 3: OBSERVATION — what happened?
        if status == "crash":
            obs_content = f"Experiment crashed (commit {commit})"
        else:
            obs_content = (
                f"val_bpb={val_bpb:.6f}, peak_vram={memory_gb:.1f} GB"
            )
        observation = make_step(
            StepType.OBSERVATION,
            content=obs_content,
            parent_id=action.id,
            metadata={
                "val_bpb": val_bpb,
                "peak_vram_gb": memory_gb,
                "crashed": status == "crash",
            },
        )
        trace.add_step(observation)

        # Step 4: EVALUATION — how does it compare?
        if status == "crash":
            eval_content = "Cannot evaluate — experiment crashed"
            delta = None
        elif best_bpb is not None and val_bpb > 0:
            delta = val_bpb - best_bpb
            direction = "better" if delta < 0 else "worse"
            eval_content = (
                f"Delta from best: {delta:+.6f} ({direction}). "
                f"Best was {best_bpb:.6f}, this is {val_bpb:.6f}."
            )
        else:
            eval_content = (
                f"Baseline establishment: val_bpb={val_bpb:.6f}"
            )
            delta = None

        evaluation = make_step(
            StepType.EVALUATION,
            content=eval_content,
            parent_id=observation.id,
            metadata={
                "baseline_bpb": best_bpb,
                "delta_bpb": delta,
            },
        )
        trace.add_step(evaluation)

        # Step 5: DECISION — keep, discard, or crash
        decision = make_step(
            StepType.DECISION,
            content=f"Decision: {status}",
            parent_id=evaluation.id,
            metadata={"status": status},
        )
        trace.add_step(decision)

        trace.outcome = status
        return trace

    def capture_from_strategy_md(
        self, path: str | Path
    ) -> ReasoningTrace:
        """Extract meta-reasoning from strategy.md or program.md.

        Strategy documents contain reflection-level reasoning:
        what categories of experiments to try, what has been learned,
        what to prioritize. This captures that as a single REFLECTION
        trace.

        Args:
            path: Path to strategy.md or program.md.

        Returns:
            A single ReasoningTrace capturing the strategic reasoning.
        """
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Strategy file not found: {path}")

        content = path.read_text(encoding="utf-8")
        trace = make_trace(
            domain="autoresearch",
            topology=ReasoningTopology.CHAIN,
            tags=["meta", "strategy"],
        )

        # Extract section headers as individual reflection steps
        sections = self._extract_sections(content)

        parent_id = None
        for heading, body in sections:
            step = make_step(
                StepType.REFLECTION,
                content=f"{heading}\n{body.strip()}" if body.strip() else heading,
                parent_id=parent_id,
                metadata={"section": heading},
            )
            trace.add_step(step)
            parent_id = step.id

        trace.outcome = "strategy_captured"
        return trace

    def summary(self, traces: list[ReasoningTrace]) -> dict:
        """Compute summary statistics from a set of experiment traces.

        Returns:
            Dictionary with counts, best result, keep/discard/crash rates.
        """
        total = len(traces)
        if total == 0:
            return {"total": 0}

        outcomes = [t.outcome for t in traces]
        keeps = outcomes.count("keep")
        discards = outcomes.count("discard")
        crashes = outcomes.count("crash")

        # Find best val_bpb across all traces
        best_bpb = None
        for trace in traces:
            for step in trace.get_steps_by_type(StepType.OBSERVATION):
                bpb = step.metadata.get("val_bpb", 0)
                if bpb > 0 and (best_bpb is None or bpb < best_bpb):
                    best_bpb = bpb

        return {
            "total": total,
            "keeps": keeps,
            "discards": discards,
            "crashes": crashes,
            "keep_rate": keeps / total if total > 0 else 0,
            "best_val_bpb": best_bpb,
        }

    # -- Helpers --

    @staticmethod
    def _parse_float(value: str) -> float:
        """Safely parse a float, returning 0.0 on failure."""
        try:
            return float(value.strip())
        except (ValueError, AttributeError):
            return 0.0

    @staticmethod
    def _extract_sections(markdown: str) -> list[tuple[str, str]]:
        """Extract (heading, body) pairs from markdown text."""
        sections: list[tuple[str, str]] = []
        lines = markdown.split("\n")
        current_heading = ""
        current_body: list[str] = []

        for line in lines:
            if line.startswith("#"):
                if current_heading:
                    sections.append(
                        (current_heading, "\n".join(current_body))
                    )
                current_heading = line.lstrip("#").strip()
                current_body = []
            else:
                current_body.append(line)

        if current_heading:
            sections.append((current_heading, "\n".join(current_body)))

        return sections
