---
name: codex-work-orchestration
description: Coordinate dependencies and shared ownership across workers, cross-thread or cross-host handoffs, and requested continuity or monitoring. Ordinary single-worker delegation, model selection, schedule creation, and individual messages do not require this skill.
---

# Codex Work Orchestration

Use this skill for a concrete coordination need beyond a native tool call. Ordinary delegation follows AGENTS.md and the directly accessible [model and route defaults](references/user-work-preferences.md); it does not require this workflow. A single bounded worker uses its own execution skill only when that route needs one. Native Codex delegation does not require an extra execution skill. A Claude model name alone does not select Claude Code CLI or agmsg.

The parent owns requirements, quality, integration, and final acceptance. Within an authorized task, capable subagents may investigate, implement, edit, and produce finished artifacts without separate delegation approval; retain model-specific authorization. Global-memory improvements follow `edit-global-memory`, including its delegated Astra・low editing owner and source handoff. A general coordination workflow does not override that procedure or user-specified ownership.

Read only the procedure needed now:

- Multiple workers with dependencies or shared editing scope, or an assignment needing coordinated correction/integration: [coordination.md](references/coordination.md). Keep one owner per write set and return corrections to the same owner.
- Cross-thread/host handoff, resumption, waiting, or requested Goal/Heartbeat/monitoring: [continuity.md](references/continuity.md). Ordinary schedule creation and individual authorized messages use the native tool schema and actual target state directly.
- Model/route selection: [user-work-preferences.md](references/user-work-preferences.md). Consultation/Fable-specific rules are linked there and loaded only when applicable.

Do not create Goals, automations, threads, monitors, or agents merely because work is large or divisible. Use `goal-setter` and a Goal only for an explicit persistent objective, an automation for requested recurring work or later resumption, and a new thread only when the user explicitly requests one. Use native completion and follow-up channels for native agents. Preserve explicit routes and existing external sessions; add no always-on worker pool or empty periodic model calls.
