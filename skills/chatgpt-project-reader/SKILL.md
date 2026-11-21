---
name: chatgpt-project-reader
description: Open and read relevant ChatGPT Projects from the current Codex context. Use when the user asks Codex to inspect, understand, summarize, or use past ChatGPT project chats, ChatGPT Projects, project chat history, or phrases such as "ChatGPTのプロジェクト", "プロジェクトのチャット", "過去チャット", or "研究プロジェクト" without giving a fixed project URL.
---

# ChatGPT Project Reader

Read relevant ChatGPT Project conversations. Prefer available app tools such as list_projects, list_threads, and read_thread when they can retrieve the requested context. Use the browser workflow below only for context those tools cannot retrieve. Remain read-only unless the user explicitly requests a change.

## Workflow

1. Identify the target from current context. Prefer an already-open matching project; otherwise use the workspace path, nearest `AGENTS.md`, project documents, and the user's wording. Do not hardcode a project or URL. If projects remain equally plausible, ask the user to choose.
2. Use the Codex in-app Browser skill. Navigate to `https://chatgpt.com/` unless a matching project is already open; enable visibility only when requested. If login is required, report it and do not search local files, logs, keychains, or settings for credentials.
3. Open the matching project from the sidebar/list (or continue from an already matching `/project` or project-chat URL), then find the needed chat by title, preview, or user keywords. Use ChatGPT search for long lists and open only relevant chats; do not guess URLs.
4. Read via DOM snapshots or visible text, scrolling as needed. Report the chat title, URL, distilled findings, and which points are confirmed versus inferred.

## Safety

- Treat this as read-only by default.
- Do not send messages, create chats, edit project instructions, upload files, rename projects, delete chats, or change settings unless the user explicitly asks for that specific action.
- Obtain authorization for actions outside the current request; do not re-confirm an exact action the user has already authorized.
- Do not store ChatGPT credentials, session tokens, cookies, or copied private chat contents in skill files.
