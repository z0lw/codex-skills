# Relay workflow

## Canonical paths

- Repository: `<your-twitter-api-safe-relay-repo>`
- Settings: `<your-twitter-api-safe-relay-repo>/settings.json`
- Saved profile root: `<your-twitter-api-safe-relay-repo>/user_data/`
- Request client: `packages/request/`
- HTTP server: `packages/server/`

The server reads the workspace settings through its package working directory. Run workspace scripts from the repository root.

## Preflight

1. Read `README.md`, `settings.json`, `packages/server/src/app.ts`, and `packages/server/src/server.ts` when the repository revision differs from the last observed revision.
2. Check the configured port with `lsof -nP -iTCP:<port> -sTCP:LISTEN`.
3. If a listener exists, identify its command and working directory. Reuse it only when it is this relay and its configuration matches the requested account.
4. Never read the browser profile's Cookie, Login Data, Local Storage, or token-bearing files.

## Start an on-demand relay

From the repository root:

```sh
pnpm start:relay
```

Use the development entry point only when the built output is missing or the repository is under active development:

```sh
pnpm dev:relay
```

Wait for both the browser launch confirmation and `Relay server is running on http://localhost:<port>`. Record the launched process so only that process is stopped at cleanup.

## Send requests

Use the bundled helper:

```sh
python3 ~/.codex/skills/search-x-with-safe-relay/scripts/relay_request.py \
  --method GET \
  --path /2/example \
  --query-json '{"key":"value"}'
```

The helper accepts only loopback HTTP URLs and the relay's `/2/`, `/1.1/`, and `/i/api/graphql/` route families. It prints transport metadata to stderr and the response body to stdout.

For a GraphQL GET request, pass the captured `variables`, `features`, and `fieldToggles` objects as JSON-encoded query parameter values. For a GraphQL POST read query, pass the captured body unchanged with `--body-json`. Never replay a mutation.

## Capture a changed X Web App request

Use this only when a current read request cannot be reconstructed from verified repository code or a current response:

1. Start the debug server from the repository root with `pnpm start:relay:debug` or `pnpm dev:relay:debug`.
2. Start the dashboard separately with `pnpm dev:dashboard` if the built debug UI is unavailable.
3. Enable debug capture through the local dashboard.
4. In the Playwright browser launched for the configured profile, perform only the requested read navigation or search.
5. Select the matching captured request by operation name, request time, and variables. Confirm that it is a query/read operation.
6. Replay the captured request through the relay, changing only the user-requested search variables. Keep captured feature flags and field toggles intact.
7. Stop the processes launched for this task.

Do not retain response payloads containing unrelated timeline or account data after the task.

## Evidence extraction

For every relied-upon post, retain:

- post ID;
- author handle and display name when returned;
- creation timestamp;
- full text, including note-tweet or long-form fields when present;
- quoted or reposted source identity;
- canonical `x.com/<handle>/status/<id>` URL.

Use the response's timeline instructions and entry order rather than assuming that recursive JSON order equals ranking. Separate promoted entries and non-post modules from organic post results.
