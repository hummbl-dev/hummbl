# HUMMBL Monorepo Makefile
# ========================
# Targets for build, test, lint, and boundary enforcement.

PYTHON ?= python3
PYTEST ?= pytest

.PHONY: setup test lint check-boundaries check help

# ─── Setup ──────────────────────────────────────────────────────
setup:
	$(PYTHON) -m venv .venv
	. .venv/bin/activate && pip install -e ".[test,dev]"
	@echo "Done. Run: source .venv/bin/activate"

# ─── Test ───────────────────────────────────────────────────────
test:
	$(PYTEST) -q

# ─── Lint ───────────────────────────────────────────────────────
lint:
	ruff check hummbl tests

# ─── Boundary Checks (INV-5: Mechanical Enforcement) ───────────
check-boundaries: check-layers check-pins check-kernel check-caes check-namespace
	@echo ""
	@echo "All boundary checks passed."

check-layers:
	@echo "── B_LAYER_UNCLASSIFIED ──"
	$(PYTHON) scripts/check_layer_map.py

check-pins:
	@echo "── B_PIN_MISMATCH ──"
	$(PYTHON) scripts/check_pins.py

check-kernel:
	@echo "── B_VALIDATOR_OVERRIDE ──"
	$(PYTHON) scripts/check_kernel_imports.py

check-caes:
	@echo "── B_CAES_STALE_COPY ──"
	$(PYTHON) scripts/check_caes_hash.py

check-namespace:
	@echo "── B_NAMESPACE_LEAK ──"
	$(PYTHON) scripts/check_namespace_ledger.py

# ─── Full Gate (lint + test + boundaries) ───────────────────────
check: lint test check-boundaries
	@echo ""
	@echo "Full gate passed."

# ─── Help ───────────────────────────────────────────────────────
help:
	@echo "HUMMBL Makefile targets:"
	@echo "  setup             One-command bootstrap"
	@echo "  test              Run all tests"
	@echo "  lint              Lint both languages"
	@echo "  check-boundaries  Run all boundary CI checks locally"
	@echo "  check             Full local gate (lint + test + boundaries)"
	@echo ""
	@echo "Individual boundary checks:"
	@echo "  check-layers      B_LAYER_UNCLASSIFIED"
	@echo "  check-pins        B_PIN_MISMATCH"
	@echo "  check-kernel      B_VALIDATOR_OVERRIDE"
	@echo "  check-caes        B_CAES_STALE_COPY"
	@echo "  check-namespace   B_NAMESPACE_LEAK"
