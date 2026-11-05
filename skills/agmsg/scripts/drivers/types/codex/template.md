<!-- Codex overlay for the shared SKILL.md. -->

<!-- agmsg:slot shell-extra -->
On Windows PowerShell, invoke Git Bash explicitly and keep the full `bash -lc` payload inside one single-quoted string:

`& 'C:\Program Files\Git\bin\bash.exe' -lc '~/.agents/skills/__SKILL_NAME__/scripts/whoami.sh "$(pwd)" codex'`

Do not use POSIX `'"'"'` quote splicing in PowerShell, and do not use escaped double quotes inside the wrapper.

<!-- /agmsg:slot shell-extra -->

<!-- agmsg:slot delivery -->
<!-- agmsg:render-overlay __AGENT_TYPE__ -->
  4. **REQUIRED — Do NOT skip this step.** Run `~/.agents/skills/__SKILL_NAME__/scripts/delivery.sh status __AGENT_TYPE__ "$(pwd)"` and preserve any established delivery mode without running set. Only for a new project with no established mode, run `~/.agents/skills/__SKILL_NAME__/scripts/delivery.sh set monitor __AGENT_TYPE__ "$(pwd)"`. Do not ask the user to choose a mode. Follow the printed setup instructions when monitor is newly enabled.
<!-- /agmsg:slot delivery -->

<!-- agmsg:slot actas -->
If argument starts with "actas" followed by an agent name:
If no name is specified, inspect the team roster and choose an unused name following the existing convention or current project/role. Resolve the team from existing registration and provenance without asking the user.
1. Run `~/.agents/skills/__SKILL_NAME__/scripts/identities.sh "$(pwd)" __AGENT_TYPE__`. If `<name>` is not listed, join with `~/.agents/skills/__SKILL_NAME__/scripts/join.sh <team> <name> __AGENT_TYPE__ "$(pwd)"`.
2. Record this Codex thread so a later spawn can resume it, together with optional profile metadata: `~/.agents/skills/__SKILL_NAME__/scripts/drivers/types/codex/codex-record-session.sh <team> <name>`. Both arguments are required; `<team>` is the team `<name>` belongs to (from step 1). Without them nothing is recorded and the monitor cannot deliver to this thread.
3. Use the role as the active FROM; monitor delivery is routed only to its recorded thread.
<!-- /agmsg:slot actas -->

<!-- agmsg:slot drop -->
If argument starts with "drop", run `reset.sh "$(pwd)" __AGENT_TYPE__ <name>` and clear the role's recorded Codex seat.
<!-- /agmsg:slot drop -->

<!-- agmsg:slot spawn -->
If argument starts with "spawn" (e.g. "spawn claude-code alice", "spawn codex reviewer --window"):
For Fable, explicitly set reasoning effort to `medium` on both fresh starts and resumes. Do not rely on inherited effort or an omitted option. Set `AGMSG_SPAWN_OPTIONS_FILE` for that invocation to a task-local YAML file whose `claude-code:` section includes `--effort: medium` and preserves the existing launch options, including `--settings` and `--permission-mode`. Use the same role and resumable session, then verify `--effort medium` in the actual CLI arguments before consultation. Do not change other Claude defaults or the global spawn configuration. `spawn.sh` does not accept `--effort` directly; use this supported spawn-options route.

1. Parse `<type>` (a spawnable agent type), `<name>`, and any options (`--boot-prompt <text>`, `--project <path>`, `--team <team>`, `--window`, `--split h|v`, `--terminal <template>`, `--no-wait`, `--ready-timeout <secs>`, `--model <id>`, `--fresh`).
2. Run: `~/.agents/skills/__SKILL_NAME__/scripts/spawn.sh <type> <name> --project "$(pwd)" [options]`
   - `spawn.sh` pre-joins `<name>`, then opens a new pane or window through the terminal driver and launches the target CLI with `$__SKILL_NAME__ actas <name>` as its initial prompt. `--boot-prompt` appends a first task to that prompt. Codex spawn uses the bundled shim and bridge. Which terminal that is is the driver's decision, never something to name here.
   - By default it blocks until a spawned Claude Code agent's watcher attaches and prints `status=ready`; `--no-wait` returns immediately. A spawned Codex agent has no Monitor and skips the readiness wait.
   - It refuses early when `<name>` is already held by another live session, the target CLI is missing, the project path is invalid, or the terminal driver has nowhere to place it.
3. Show the script's output.

If argument starts with "despawn" (e.g. "despawn reviewer", "despawn alice --force"):
1. Parse `<name>` and any options (`--force`, `--timeout <secs>`). `despawn` tears down a member previously spawned by this session.
2. Determine which team `<name>` belongs to, then run:
   `~/.agents/skills/__SKILL_NAME__/scripts/despawn.sh <team> $AGENT <name> [--force] [--timeout <secs>]`
   - The default graceful path sends a `ctrl:despawn` message so a Claude Code member's watcher drops its role and closes its spawned pane, then waits for the lock to release.
   - A Codex member has no watcher, so use `--force` for it. `--force` skips the message, tears down the recorded pane/window, and drops the registration directly.
3. Show the script's output.
<!-- /agmsg:slot spawn -->

<!-- agmsg:slot mode -->
If argument is "mode", run `delivery.sh status __AGENT_TYPE__ "$(pwd)"`.

For `mode monitor|turn|off`, run `delivery.sh set <mode> __AGENT_TYPE__ "$(pwd)"`; `both` is unsupported. Legacy `hook on` maps to `turn`; `hook off` maps to `off`.
<!-- /agmsg:slot mode -->

<!-- agmsg:slot identity-before-delivery -->
## Identity

Treat an explicit identity, route, team, agent, or delivery value as
authoritative. Otherwise, resolve all five from the current project/path,
host, role, and session provenance plus existing registrations. Reuse an
exact compatible registration when one exists; otherwise choose the closest
safe, non-colliding match and break ties deterministically. Never ask the user
to choose among values that this provenance and registration data can resolve.
Preserve an established delivery mode exactly. For a new project with no
established delivery mode, the normal default is `monitor`.

## Durable correction routing

When the user gives a durable correction (for example, "二度と", "以後", or
"今後"), begin the global-memory update required by the operating guide and
also update the canonical source that governs the corrected behavior in the
same turn. For corrections to agmsg behavior, this `SKILL.md` is that source;
for another skill or a project, update that skill or project's applicable
instruction file instead. Do not treat either edit as sufficient by itself:
validate both and only then return to the parent task. A durable correction
must result in an actual write, not an acknowledgement or an unrelated memory
change. Do not ask the user to choose among agent identities, teams, or
delivery routes when current project/provenance and existing registrations
determine a safe choice; select it in the agent and continue. This rule does
not remove explicit approval questions for external writes, authentication,
permissions, or other high-impact operations.

If you already know your AGENT and TEAMS from a previous `$__SKILL_NAME__` call in this session, skip to **Execute** below.

Otherwise, run: `~/.agents/skills/__SKILL_NAME__/scripts/whoami.sh "$(pwd)" codex`

Four possible outputs:

**A) Single identity:**
`agent=<name> teams=<t1,t2,...> type=codex project=<path>`
→ Remember AGENT and TEAMS, then go to **Execute**.

**B) Multiple identities:**
`multiple=true agents=<n1,n2,...> teams=<t1,t2,...> type=codex project=<path>`
→ Select the identity whose project/path, role, and existing session provenance
best match the current invocation. Prefer an exact project/path registration,
then the current role/session, then the stable base identity already used by
this project; break any remaining tie deterministically by the listed order.
Never ask the user to choose. Remember the selected AGENT and TEAMS, then go
to **Execute**.

**C) Not in a team:**
`not_joined=true available_teams=<t1,t2,...>` (or `available_teams=none`)
→ Choose the available team whose roster or project provenance best matches
the current project. If none matches, create a team name derived from the
current project without a collision. Choose an unused agent name by extending
the current team's naming convention, or use a deterministic project-derived
name when no convention exists. Do not ask the user for either choice, then:

  Before first-time setup, inspect the user's request. If they ask to join, import, or bring in a team that already exists on a server, do not call `join.sh`. Go directly to `remote pull` under Execute. First run `~/.agents/skills/__SKILL_NAME__/scripts/team-list.sh --json --scope all`; if a same-named local team has `binding_state` `none` or `disconnected`, stop and ask the user how to proceed. After pull succeeds, return to Identity setup so the user can register a new local agent in the pulled team.

  > **First-time setup required.**
  > Joining the project-matching team so this agent can send and receive messages.

  1. Run `~/.agents/skills/__SKILL_NAME__/scripts/team.sh <team>` when the selected team already exists, and derive the unused name from that roster.
  2. **You MUST use join.sh** — run: `~/.agents/skills/__SKILL_NAME__/scripts/join.sh <team> <agent_name> codex "$(pwd)"`
  3. Show the result and explain:

  > **Joined!** You can now use `$__SKILL_NAME__` to check and send messages.
  > - `$__SKILL_NAME__` — check inbox
  > - `$__SKILL_NAME__ send <agent> <message>` — send a message
  > - `$__SKILL_NAME__ team` — list team members
  > - `$__SKILL_NAME__ history` — message history

<!-- /agmsg:slot identity-before-delivery -->

<!-- agmsg:slot identity-after-delivery -->
  5. Then check inbox for the newly joined team.

**D) Suggestions for reuse:**
`suggest=true agents=<n1,n2,...> teams=<t1,t2,...> type=codex project=<path> available_teams=<t1,t2,...>`
→ No exact registration exists for this project, but there are same-type agent names registered elsewhere.

  1. Choose the suggested identity and team with the closest project/path and
     role provenance; if none is closer, choose the first unused suggestion
     and the closest available team. Never ask the user to choose.
  2. Run: `~/.agents/skills/__SKILL_NAME__/scripts/join.sh <team> <agent_name> codex "$(pwd)"`
  3. Then continue with the normal post-join flow above.

<!-- /agmsg:slot identity-after-delivery -->

<!-- agmsg:slot execute-extra -->
For `send`, preserve the supported `--body-file <path>` or `--body -` options. Prefer a body file for multiline prose, code, backticks, or shell substitutions: run `bash ~/.agents/skills/__SKILL_NAME__/scripts/send.sh $TEAM $AGENT <to_agent> --body-file <path>`. Do not interpolate that content into a shell command. Sending still requires authorization for the recipient and content.

For `doctor`, run `bash ~/.agents/skills/__SKILL_NAME__/scripts/doctor.sh` with the requested filters (`--project`, `--type`, `--team`, `--redacted`). Its default is read-only; report configuration separately from runtime delivery. For an authorized cleanup of obsolete runtime records, use `doctor.sh --fix --yes`; fix mode does not accept filters or `--redacted`, and does not repair stale locks or change delivery modes. Never treat a stale-lock report as permission to drop an existing role.
<!-- /agmsg:slot execute-extra -->
