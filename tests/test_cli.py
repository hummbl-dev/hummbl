"""Tests for HUMMBL CLI bootstrap tooling."""

from __future__ import annotations

from pathlib import Path

from hummbl import __version__
from hummbl.cli import main, repo_root, verify_layout


def test_repo_root_has_pyproject() -> None:
    root = repo_root()
    assert (root / "pyproject.toml").is_file()


def test_verify_layout_passes_for_repo() -> None:
    root = repo_root()
    is_valid, missing, _warnings = verify_layout(root)
    assert is_valid, f"missing={missing}"


def test_main_verify_layout_returns_zero() -> None:
    assert main(["verify-layout"]) == 0


def test_main_version_prints(capsys) -> None:
    try:
        main(["--version"])
    except SystemExit as exc:
        assert exc.code == 0
    out = capsys.readouterr().out
    assert __version__ in out


def test_verify_layout_detects_missing_items(tmp_path: Path) -> None:
    (tmp_path / ".git").mkdir(parents=True)
    (tmp_path / ".git" / "config").write_text(
        "[remote \"origin\"]\nurl = git@github.com:hummbl-dev/hummbl.git\n",
        encoding="utf-8",
    )
    ok, missing, _warnings = verify_layout(tmp_path)
    assert not ok
    assert missing
