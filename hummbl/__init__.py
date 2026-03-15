"""HUMMBL — Structured reasoning framework for AI agents.

HUMMBL provides composable reasoning engines, inspectable traces,
and domain-specific protocols. It formalizes how agents think,
not just what they do.
"""

__version__ = "0.1.0"

from hummbl.reasoning import (
    ReasoningTopology,
    StepType,
    ReasoningStep,
    ReasoningTrace,
)
from hummbl.protocols import (
    ReasoningProtocol,
    ScientificMethod,
    QualityAssessment,
)
from hummbl.capture import AutoresearchCapture
from hummbl.analyzer import TraceAnalyzer
