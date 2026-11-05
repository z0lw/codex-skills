#!/usr/bin/env python3
"""Send a constrained JSON request to a loopback twitter_api_safe_relay."""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


ALLOWED_HOSTS = {"127.0.0.1", "localhost", "::1"}
ALLOWED_PREFIXES = ("/1.1/", "/2/", "/i/api/graphql/")


def load_json(value: str | None, label: str) -> Any:
    if value is None:
        return None
    raw = Path(value[1:]).read_text(encoding="utf-8") if value.startswith("@") else value
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"{label} is not valid JSON: {exc}") from exc


def encode_query(data: Any) -> str:
    if data is None:
        return ""
    if not isinstance(data, dict):
        raise SystemExit("--query-json must decode to an object")

    encoded: dict[str, str] = {}
    for key, value in data.items():
        if not isinstance(key, str):
            raise SystemExit("--query-json keys must be strings")
        if isinstance(value, (dict, list, bool)) or value is None:
            encoded[key] = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        else:
            encoded[key] = str(value)
    return urllib.parse.urlencode(encoded)


def validate_base_url(value: str) -> str:
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme != "http" or parsed.hostname not in ALLOWED_HOSTS:
        raise SystemExit("--base-url must be an HTTP loopback URL")
    if parsed.path not in ("", "/") or parsed.params or parsed.query or parsed.fragment:
        raise SystemExit("--base-url must not contain a path, query, or fragment")
    try:
        port = parsed.port
    except ValueError as exc:
        raise SystemExit(f"invalid --base-url port: {exc}") from exc
    if port is None or not 1 <= port <= 65535:
        raise SystemExit("--base-url must include a valid port")
    return value.rstrip("/")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:3000")
    parser.add_argument("--method", choices=("GET", "POST"), default="GET")
    parser.add_argument("--path", required=True)
    parser.add_argument("--query-json", help="JSON object or @file containing query parameters")
    parser.add_argument("--body-json", help="JSON value or @file used as the POST body")
    parser.add_argument("--timeout", type=float, default=45.0)
    parser.add_argument("--raw", action="store_true", help="Do not pretty-print JSON responses")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base_url = validate_base_url(args.base_url)
    if not args.path.startswith(ALLOWED_PREFIXES):
        raise SystemExit(f"--path must start with one of: {', '.join(ALLOWED_PREFIXES)}")
    if "://" in args.path or "?" in args.path or "#" in args.path:
        raise SystemExit("--path must be a relative relay path without a query or fragment")
    if args.timeout <= 0 or args.timeout > 180:
        raise SystemExit("--timeout must be greater than 0 and at most 180 seconds")

    query = encode_query(load_json(args.query_json, "--query-json"))
    url = f"{base_url}{args.path}"
    if query:
        url = f"{url}?{query}"

    body = load_json(args.body_json, "--body-json")
    if args.method == "GET" and body is not None:
        raise SystemExit("--body-json is only valid with POST")
    payload = None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    headers = {"Accept": "application/json"}
    if payload is not None:
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=payload, headers=headers, method=args.method)
    try:
        with urllib.request.urlopen(request, timeout=args.timeout) as response:
            status = response.status
            content_type = response.headers.get_content_type()
            response_body = response.read()
    except urllib.error.HTTPError as exc:
        status = exc.code
        content_type = exc.headers.get_content_type()
        response_body = exc.read()
    except urllib.error.URLError as exc:
        print(f"relay request failed: {exc.reason}", file=sys.stderr)
        return 2

    print(f"HTTP {status} {content_type}", file=sys.stderr)
    text = response_body.decode("utf-8", errors="replace")
    if args.raw or content_type != "application/json":
        print(text)
    else:
        try:
            print(json.dumps(json.loads(text), ensure_ascii=False, indent=2))
        except json.JSONDecodeError:
            print(text)
    return 0 if 200 <= status < 300 else 1


if __name__ == "__main__":
    raise SystemExit(main())
