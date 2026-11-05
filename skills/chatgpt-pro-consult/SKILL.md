---
name: chatgpt-pro-consult
description: Consult ChatGPT Pro through the Codex in-app browser with strict route and model verification. Use when the current request explicitly asks to "プロに相談", "ChatGPT Proに相談", "GPT Proで確認", or an applicable instruction expressly requires Pro for that consultation. Generic requests to ask or research with ChatGPT, past permission to use Pro, and an already selected Pro model do not trigger this skill. Do not use for ordinary Codex answers, questions about Pro as a product, or mere mentions of Pro.
---

# ChatGPT Pro Consult

## Applicability

「ChatGPTに相談」「ChatGPTに探させる」「ChatGPTに調べさせる」はサービスの指定であり、Proの指定ではない。これらは `chatgpt-research` で扱う。過去のPro利用許可や画面上の現在モデルを根拠に、この依頼へPro指定を追加したり、本スキルのPro選択手順を適用したりしない。モデル未指定時の扱いは同スキルに従い、観測したモデルとユーザーが指定したモデルを区別して報告する。

## Core Rule

Treat "Pro consultation" as incomplete until the consultation prompt is sent from the Codex in-app browser while the visible ChatGPT model is `Pro`, and the Pro response has been read back into Codex.

Do not satisfy this skill with Codex reasoning alone, ChatGPT.app, Chrome, OAuth/SSO/login flows, external Playwright, Computer Use, a different model, an old answer, or a plan to consult later.

Treat topic isolation as part of the completion criteria. A prompt sent into an unrelated existing ChatGPT conversation does not count as a valid Pro consultation, even when the visible model is `Pro`.

Treat ChatGPT Pro turns as scarce. Prepare the prompt locally until it is complete before sending, and do not spend additional Pro turns to repair avoidable prompt mistakes.

For a consultation request, the authorization covers the initial prompt and the substantive same-conversation follow-ups needed to test the answer, resolve contradictions, and reach fulfilled, mismatched, or unresolved status. Do not regenerate, repeat, or stop an in-progress response except to prevent an active high-impact unintended submission. If the user explicitly requests a single inquiry, send one prompt only and do not report it as a completed consultation under the global contract.

## Required Workflow

1. Use the Browser skill for the Codex in-app browser.
   - Read and follow the Browser skill if it has not already been loaded.
   - Use the `iab` browser surface.
   - Do not switch to Chrome, ChatGPT.app, Computer Use, external Playwright, OAuth, SSO, or a login page unless the user explicitly changes the required route after an explicit unmet report.

2. Confirm the target ChatGPT screen.
   - Use a ChatGPT conversation whose topic matches the current user objective.
   - Do not reuse an unrelated prior consultation thread, even if it is already open and already set to `Pro`.
   - Continue the existing ChatGPT conversation when it is the same ongoing objective or a natural follow-up, so Pro can preserve useful project context across turns.
   - Start a new ChatGPT conversation only when the current visible conversation belongs to another objective, project, memory update, previous incident, contaminated context, or the user explicitly asks to reset.
   - Prefer the already-open ChatGPT tab when its visible context matches the current objective; do not create fresh chats by default just to be topic-isolated.
   - Record the current URL, conversation title, and visible context before sending.
   - If a new conversation is opened, re-check the visible model after opening it. Do not carry over the old thread's model state as evidence.
   - If the selected in-app browser tab is missing or stale, open the user-provided ChatGPT URL in the in-app browser.
   - If a Cloudflare "私はロボットではありません" check appears in the in-app browser, stay in the same tab: move focus to the checkbox with Tab / Shift+Tab (focus ring visible on the checkbox) and press Space, then confirm the ChatGPT page loaded (verified 2026-10-20). Mouse, frame-locator, and coordinate clicks did not work on that widget. Never switch to Chrome, Zen, the ChatGPT app, or another browser profile to reach ChatGPT, and never log in or choose an account there.

3. Verify `Pro` before composing the final send.
   - Inspect the visible model button or model picker.
   - In the current slider UI (verified 2026-09-16), choose `最新` and move the thinking-effort/power slider to its rightmost setting. Verify the resulting visible `Pro` label (observed as `6 Pro`, `Pro、5件中5件目。`). Pro need not appear as a separate model-list entry; inspect this slider before declaring it unavailable.
   - Use the visible power control or its documented arrow-key interaction. If the snapshot exposes a slider but its locator cannot resolve, target the enclosing visible `パワー` menu item and press ArrowRight, then inspect the resulting label. Do not assume an arbitrary rightmost setting is Pro without the label.
   - In an older UI with a separate Pro model entry, select that entry and re-check the visible model display.
   - If `Pro` is unavailable, hidden, ambiguous, or blocked by authentication, mark the task as unmet for the specified route. Do not use `Auto`, `Instant`, `Thinking`, another model, plan/subscription text, or account status as a substitute.

4. Build the consultation prompt.
   - Draft and review the full prompt locally before touching the composer. The prompt must already contain the task objective, relevant source text, output format, preservation requirements, and known constraints.
   - Do not use Pro interactively to discover requirements that can be derived from the user's message, existing files, or local inspection.
   - Include the user's exact objective, required output format, and relevant current artifacts or file contents.
   - Ask Pro for the final usable artifact when the user wants creation or rewrite, not only critique or high-level advice.
   - When the prompt transmits private local content that the user did not explicitly ask to share, stop and ask for approval at action time. If the user explicitly requested Pro to rewrite/review that content, continue within that scope.
   - For memory, AGENTS.md, skill, or instruction rewrites, use lossless-preservation mode:
     - First build a protected-facts inventory from the existing files before asking Pro to rewrite.
     - Treat the entire source document's semantics as protected by default. Do not reduce preservation to a few examples.
     - If concrete directives are listed, introduce them as non-exhaustive examples such as "including but not limited to"; never let examples become the only preservation requirements.
     - Explicitly require that no instruction, constraint, exception, local environment detail, tool route, model gate, profile mapping, authentication limit, user-specific workflow requirement, or operational boundary be lost, generalized away, or moved to a non-default-read file.
     - Do not ask Pro to keep "only abstract global rules" unless every concrete directive to preserve is separately listed as protected.
     - Require Pro to output a preservation map: `kept`, `rewritten without semantic loss`, `moved`, `removed with reason`.
     - Treat a rewrite as incomplete if any protected fact is omitted, generalized away, or moved to a file Codex will not normally read.

5. Send only after the final gate.
   - Immediately before pressing send, verify and log: route `Codex in-app browser`, visible model `Pro`, URL, conversation title/topic, and what content category will be sent.
   - The conversation title/topic must match the current user objective, or be a fresh empty chat created for that objective.
   - If any element fails, do not send and report unmet status.

6. Wait for completion and read the answer.
   - Confirm the response is no longer generating.
   - Do not click stop/cancel/regenerate while Pro is responding unless the user explicitly authorizes it or an active high-impact unintended disclosure must be stopped.
   - Treat long Pro generation as expected. Do not insert minute-by-minute progress narration, repeated screen-state reports, unchanged "still generating" updates, or repeated cost-window-consuming checks into the main conversation.
   - Choose the waiting owner before entering any wait loop:
     - If subagents or background delegation are available and can access the needed ChatGPT/browser state, delegate exactly the wait-and-extract task immediately after sending and before the main agent performs any repeated check or wait loop. This is a required post-send action, not an optional fallback after the user complains or after the main agent has already started polling.
     - The delegated task must be limited to the same ChatGPT conversation: verify generation completion, extract the latest Pro answer verbatim, preserve line breaks/code blocks, save the raw text when requested, and report the URL/model/topic evidence. It must not start a new Pro consultation, send follow-ups, interrupt, regenerate, summarize instead of returning raw text, or integrate the answer.
     - When a `<subagent_notification>` or equivalent completion event arrives while the main task is still active, treat it as the primary trigger to resume the original Pro task. Read the notification payload first, especially saved-path, URL, model evidence, source/attachment evidence, and completion evidence; then immediately read back the saved raw answer and continue integration/verification. Do not miss the notification, treat it as an ordinary user message, wait for the user to point it out, or answer with status/apology before resuming the original task.
     - Do not close the main turn with `final` while Pro answer recovery or integration remains completion-critical merely because a subagent is monitoring it. This does not mean the main agent should idle-wait for the subagent. Keep working on non-overlapping preparation. When only the raw-answer return remains, use one explicit bounded recovery path such as a single `wait_agent` call or another available independent wake/recovery mechanism, then continue raw-answer readback and integration. In this environment, a subagent completion notification after `final` is not proven to wake the main agent by itself; if the next main-agent response happens only after the user sends another message, do not claim the notification woke the thread.
     - If delegation is unavailable or cannot access the needed browser state, wait on the observed completion control (for example, the current conversation's Stop button becoming hidden) with a generous bounded timeout, then extract the latest answer. A timeout alone does not justify another full snapshot: continue independent work or resume the completion wait, respecting tool blocking limits. Do not replace this with sleep-then-snapshot loops or repeatedly load the whole conversation.
   - Do not perform repeated main-agent screen polling except after a generous timeout, meaningful state change, user interruption, or real route/gate failure. A third unchanged main-agent check for the same Pro response is a process failure: stop polling, switch to delegation when possible, and update this skill or the project memory before continuing.
   - Do not write project/global memory notes whose only purpose is to avoid context compression, record that the response is still generating, or memorialize an unchanged wait state. Memory updates are only for reusable procedural corrections that change future behavior.
   - Extract the Pro answer from the current conversation.
   - For Markdown/code-block artifacts, extract from `pre`/visible code blocks in a way that preserves line breaks.

7. Apply or integrate the result.
   - If the user asked to create or update a file, apply the Pro-produced artifact to the correct file and verify it.
   - If the Pro output is incomplete, inaccessible, or malformed, report the exact gate failure before spending a replacement turn. If it is readable but raises a substantive contradiction or unsupported premise, follow up in the same conversation under the consultation authorization. Prefer local correction when the defect is deterministic.
   - For memory, AGENTS.md, skill, or instruction rewrites, compare the output against the protected-facts inventory before applying it. Do not apply full-file replacements that lose protected facts.

8. Report facts, not assumptions.
   - State that ChatGPT Pro was used only if the visible `Pro` model was confirmed before sending.
   - Include concise evidence: current URL or conversation title, topic isolation status, model display `Pro`, sent prompt purpose, files changed, and verification result.
   - If unmet, state exactly which gate failed and do not call it a consultation.

## Failure Handling

- If the in-app browser cannot access the ChatGPT conversation, report "Codex App内ブラウザ経由では未達" and the observed reason.
- If login, cookies, existing browser profile, OAuth, SSO, or external browser state is required, report unmet for this route. Do not solve it by switching tools.
- If a previous answer was generated by `Instant`, `Thinking`, `Auto`, another app, or an unverified model, treat that answer as not satisfying Pro consultation.
- If the prompt was sent into an unrelated conversation, treat that result as invalid for the current task. Record the mismatch, stop using that thread for the task, and restart in a new objective-specific ChatGPT conversation only after re-checking `Pro`.
- If a prompt was flawed, do not reflexively send a correction. First determine whether the answer can still be used, whether local repair is sufficient, and whether another Pro turn is worth asking the user to approve.
- If the user interrupts the turn, re-check the in-app browser handle, URL, and visible model before resuming. Do not reuse stale browser handles as evidence.
