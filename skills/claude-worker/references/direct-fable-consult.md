# Direct Fable consultation

Use this route only when the user selects Claude Code CLI execution for Fable,
or the required model/environment is unavailable through an authorized native
Codex route. A Fable model name alone normally routes to native Codex subagents.
If AGMSG is selected, use `$agmsg`; a successful direct CLI call never
substitutes for the selected transport.

## 1. Fix the consultation

- Fix the objective, working directory, read-only scope, prohibited changes,
  expected answer, and completion condition before launch.
- Use the latest stable Fable available through this route, with medium effort
  and no tools. Resolve the version using the [model-selection procedure](../../codex-work-orchestration/references/consultation-models.md); honor an
  explicit user-pinned version. The `fable` alias is not a fixed model ID.
  If this provider resolves it to an older version, invoke the same Claude CLI directly with the verified full ID,
  `-p --effort medium --tools '' --output-format json`, preserving stdin input,
  the working directory, transport, and session. The wrapper’s `-m` option
  alone does not apply the Fable effort/no-tools settings.
- The current parent retains the objective, decision, follow-up questions, and
  acceptance. Delegate command execution through the applicable bounded
  execution owner when required by the active orchestration rules.

## 2. Start safely

Pass the prompt only through stdin:

```bash
~/.codex/skills/claude-worker/scripts/claude-worker.sh \
  -F -C /absolute/project/path <<'PROMPT'
<complete read-only consultation prompt>
PROMPT
```

The wrapper passes stdin directly to a quoted single Claude prompt and fixes:

```text
-p --model fable --effort medium --permission-mode bypassPermissions
--tools '' --output-format json
```

Do not interpolate `PROMPT`, `FOLLOWUP`, or `CWD` into a shell command. Do not
use `eval`, unquoted here-documents, raw expansion, `echo`, a background
process, `continue`, or `fork`.

## 3. Verify and follow up

For every turn require:

- process exit code 0;
- valid JSON;
- a UUID `.session_id`;
- `.result` preserved verbatim;
- the expected model and absolute working directory.

Record the initial session ID. Send answer-dependent follow-ups only to that
same session:

```bash
~/.codex/skills/claude-worker/scripts/claude-worker.sh \
  -F -C /absolute/project/path -r <session_id> <<'PROMPT'
<answer-dependent follow-up>
PROMPT
```

Require the returned session ID to remain unchanged. A model, session, or CWD
mismatch, malformed JSON, nonzero exit, or resume failure is `BLOCKED`; do not
silently create a replacement session or call a different route successful.
Monitor a running call through the same execution session rather than
launching duplicates.

## 4. Complete and return

A launch, ID, registration, or first answer alone is not a completed
consultation. Continue in the same session until the objective is fulfilled,
mismatched, or explicitly unresolved. Preserve the prompt, verbatim responses,
session/model/CWD evidence, turn count, adopted/rejected advice, and unresolved
items. Then return to the parent task and integrate only accepted conclusions.
