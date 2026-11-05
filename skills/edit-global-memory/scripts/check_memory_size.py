#!/usr/bin/env python3
"""Check the UTF-8 byte size of the Codex global memory file."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


DEFAULT_PATH = Path.home() / ".codex" / "AGENTS.md"
DEFAULT_LIMIT = 20_000
# The final section for requirements the user specially designates as mandatory
# is excluded from the cap and may grow beyond it.
REQUIRED_HEADING = re.compile(r"^## [^\n]*本人指定の必須要件", re.MULTILINE)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", nargs="?", type=Path, default=DEFAULT_PATH)
    parser.add_argument(
        "--limit", type=int, default=DEFAULT_LIMIT,
        help="optional stricter limit; cannot exceed the 20,000-byte memory cap",
    )
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    if not 1 <= args.limit <= DEFAULT_LIMIT:
        parser.error(f"--limit must be between 1 and {DEFAULT_LIMIT}")
    if not args.path.is_file():
        parser.error(f"memory file not found: {args.path}")

    content = args.path.read_bytes()
    try:
        content.decode("utf-8")
    except UnicodeDecodeError:
        parser.error("memory file must contain valid UTF-8")
    text = content.decode("utf-8")
    match = REQUIRED_HEADING.search(text)
    counted = text[: match.start()].encode("utf-8") if match else content
    size = len(counted)
    result = {
        "path": str(args.path.resolve()),
        "bytes": size,
        "total_bytes": len(content),
        "required_section_bytes": len(content) - size,
        "limit": args.limit,
        "remaining": args.limit - size,
        "within_limit": size <= args.limit,
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False))
    else:
        status = "OK" if result["within_limit"] else "OVER"
        print(
            f"{status}: {result['bytes']}/{result['limit']} bytes "
            f"(remaining {result['remaining']}) — {result['path']}"
        )
    return 0 if result["within_limit"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
