---
name: obsidian-codex-memo
description: Save or retrieve lightweight standalone reminders and rough notes that do not belong to an existing project. Do not invoke for project research, reports, comparisons, reference lists, deliverables, or ordinary file reading, writing, updating, and saving, including work stored in Obsidian. Handle those directly in the project's established location.
---

# Standalone scratch notes

This skill is a small memo pad for lightweight reminders, fragments, and rough notes outside existing projects. It is not the storage workflow for project work or a general Obsidian file-writing skill.

## Invocation boundary

Determine applicability from the request and the known project context before loading this skill. An Obsidian path, the word "memo", useful findings, or the need to save a file does not activate it. Ordinary file tools can read and edit Obsidian files without this skill.

Existing projects own their research, comparisons, company lists, reference materials, drafts, and deliverables, whether or not saving was explicitly requested. Use their established folders and ordinary file operations directly. Do not load this skill for those operations, route them to the generic memo folder, or create a second memo. A project's folder named `メモ/` is still part of that project and does not activate this skill. For example, internship research belongs to the established job-hunting project, not this memo workflow.

## When to write

Use this skill when preserving or retrieving a standalone lightweight reminder or rough note is the task, and the content does not belong to an existing project. Do not turn the availability of substantive research, possible reuse, or a completed report into an automatic memo-writing requirement.

Do not create or update a memo for debugging, a code or configuration fix, implementation details, a completed edit, verification results, progress, or a completion report unless the user explicitly asks to save it. Complexity, effort, successful verification, possible reuse, or a non-obvious cause do not turn work history into research knowledge. Keep these facts in the project, its tests, commit history, and the normal completion response.

Keep rough notes proportionate to their purpose. Distinguish confirmed facts, inferences, and unresolved points when needed; do not expand a memo into a formal report or a task-history archive.

Consolidate related reminders instead of creating duplicates. Do not manufacture an additional note about operating this skill itself.

## Place and reuse

Default folder: `<your-obsidian-vault>/9_その他/Codexメモ/`.

Before writing a standalone note, check for an equivalent in this memo folder. If the content belongs to an existing project or already has a project document, leave this workflow and use that project's existing document directly. Respect an explicitly designated destination. Do not create a second summary merely to populate the default folder.

For a new note, use `YYYY-MM-DD_内容が分かる日本語名.md`, with the creation date and concrete subject. Keep an existing filename when updating; record the latest verification date in the note. Create the default folder if absent, but do not add daily or project subfolders here.

Retrieve existing standalone memos when their content is relevant. Reading project documents uses the project's ordinary workflow and does not require this skill. Treat stored conclusions as dated evidence and recheck changing facts when necessary.

## What to preserve

Write a short Japanese note with only the context needed to understand the reminder:

- The concrete subject and useful names or search terms.
- The point to remember, with relevant conditions or uncertainty.
- Sources and verification date. Distinguish directly observed results from claims in an earlier answer.
- Verified source task link (`codex_thread`), working directory, and relevant artifact paths when available. Missing task metadata does not prevent saving known findings; omit unknown values.

Use only the sections the content needs. Avoid transcripts, chronological work logs, empty template fields, and generic advice. Do not impose a length cap that loses the substantive result.

Do not copy or summarize an existing project report into a generic memo. Keep reports, code, images, PDFs, and other project assets in their established project locations.

For extracted purchase numbers or similar reference data, maintain the user's designated record if there is one. Reference its location instead of spreading copies. This skill does not authorize persisting secret values: retain useful non-secret findings and refer to an already authorized secret store where needed.

## Finish

Read back the saved note and check that its conclusion is supported, its source links or local paths are accurate, and an existing equivalent was not duplicated. Follow applicable writing and commit instructions. Mention the saved or updated note with a link in the normal completion response, without asking for retrospective approval.

This skill works within the active task. It does not create a task board, scan all conversation history, or start a background synchronization service. A request to retrieve old project work belongs to that project, not this workflow.
