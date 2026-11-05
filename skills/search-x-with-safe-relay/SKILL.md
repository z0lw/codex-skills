---
name: search-x-with-safe-relay
description: Search and inspect current Twitter/X posts, accounts, timelines, and search results through the local twitter_api_safe_relay repository and its logged-in Playwright browser context. Use when a user asks to find, verify, compare, or summarize information specifically from Twitter or X; requests direct post evidence or X links; needs results that public web search misses; or explicitly asks to use twitter_api_safe_relay. Do not use it for publishing posts, likes, follows, DMs, account changes, or other write actions.
---

# Search X With Safe Relay

When the user supplies a direct URL to a public post and its content needs reading, first use `https://api.fxtwitter.com/<handle>/status/<post-id>` without opening X in a browser. Check the response code and returned post ID, author, text, creation time, and attached media against the requested URL. Before answering, identify whether the question concerns the caption, attached media, or linked source. When a post introduces a video and the user asks what it says, inspect the video’s speech and relevant visuals; translating the introduction does not answer the video question. Use accessible media/source evidence, state any unexamined portion, and do not claim full inspection from metadata or sampled frames alone. Use the authenticated relay below if the post response is unavailable or missing required X data, protected, or account-specific context is needed; an available media URL instead calls for inspecting that media.

Use the existing local relay as the authenticated, read-only route to X. Keep the repository and its saved browser profile as the source of truth; never copy cookies, tokens, or profile data into this skill.

## Workflow

### User's own saved bookmarks

1. Search the local archive first at `<your-private-notes-folder>/bookmarks/`. Read its `README.md`, then search the relevant `ブックマーク_<account>/` Markdown notes and their matching `Photo_ブックマーク_<account>/` media.
2. Do not access X to search personal bookmarks unless the user explicitly asks for an online lookup.

### Online X research

1. Read [references/relay-workflow.md](references/relay-workflow.md) before operating the relay.
2. Confirm that `<your-twitter-api-safe-relay-repo>` exists. Read its current `README.md`, `settings.json`, and relevant package source when behavior may have changed.
3. Define the requested evidence: query terms, accounts, date window, result type, and whether latest or top results matter. Respect narrower project instructions and any project-local sources designated for the request.
4. Prefer a currently known read endpoint. If the GraphQL operation, query ID, features, or field toggles are uncertain, capture the current request through the repository's debug route instead of guessing or reusing stale values.
5. Check whether the configured local port is already listening. Do not stop or replace an unknown process. If no relay is running, start the normal or debug server only for the current task, retain its process identity, wait for its ready log, and stop only that process when finished.
6. Send loopback requests with `scripts/relay_request.py`. Allow GraphQL POST only when it is a read query. Refuse mutations and any endpoint that likes, follows, posts, deletes, messages, uploads, or changes account state.
7. Inspect the response structure before extracting claims. Preserve post IDs, author handles, creation times, quoted/reposted context, and result ordering. Deduplicate by post ID.
8. Cross-check important claims against the post itself and, when the claim concerns an external fact, against an appropriate primary source. Treat deleted, unavailable, protected, rate-limited, or partially returned content as unverified rather than absent.
9. Report the search time and scope. Link evidence as `https://x.com/<handle>/status/<post-id>` and distinguish direct statements, reposts, quotes, and inference.

## Guardrails

- Keep all relay traffic on loopback. Do not expose the relay port or add a public tunnel.
- Do not inspect, print, export, or edit cookies, authorization headers, CSRF values, saved passwords, or browser-profile databases.
- Do not log in, approve OAuth, change permissions, or switch accounts without explicit user authorization.
- Do not hardcode a captured GraphQL query ID as permanent. X Web App operations change.
- Do not leave the relay, debug server, browser, or dashboard running after an on-demand task unless the user explicitly requested ongoing operation.
- Do not treat successful HTTP transport as proof that the returned X data is complete.

## Failure Handling

- If the saved profile requires login, stop at the login screen and request only the minimum user action needed; do not seek credentials elsewhere.
- If port 3000 is occupied, identify the listener before deciding whether it is the intended relay. Never kill it merely to free the port.
- If an endpoint changed, use the debug capture workflow in the reference. Do not fall back to undocumented guessed parameters.
- If X blocks or rate-limits a request, inspect the current page in the relay’s saved profile and complete available authorized ordinary recovery before concluding that the route is blocked. Apply existing permission to confirmation steps; request only an evidenced user-only action or genuinely missing permission. Keep the specified profile and route. Public web search may supplement the evidence as a labeled fallback where permitted, but does not complete a requested X search. Report the observed blocker and remaining scope after permitted recovery.
