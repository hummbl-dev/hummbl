"""HUMMBL CLI — analyze reasoning traces from the command line.

Usage:
    python -m hummbl analyze <traces.json>   — full analysis report
    python -m hummbl suggest <traces.json>   — next experiment suggestions
    python -m hummbl stats <traces.json>     — summary statistics only
"""

from __future__ import annotations

import sys
from pathlib import Path

from hummbl.analyzer import TraceAnalyzer


def main(argv: list[str] | None = None) -> int:
    args = argv or sys.argv[1:]

    if len(args) < 2:
        print(__doc__)
        return 1

    command = args[0]
    trace_path = Path(args[1])

    if not trace_path.exists():
        print(f"Error: file not found: {trace_path}")
        return 1

    analyzer = TraceAnalyzer()
    analyzer.load_traces_json(trace_path)
    result = analyzer.analyze()

    if command == "analyze":
        print(analyzer.format_stats(result))
        print()
        print(analyzer.format_suggestions(result))

    elif command == "suggest":
        print(analyzer.format_suggestions(result))

    elif command == "stats":
        print(analyzer.format_stats(result))

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
