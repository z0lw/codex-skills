# Continuity, waiting, and monitoring

## State and resumption

Keep the current objective, target, approval boundary, Done, owners, unfinished work, next action, and return point in the existing task state. Do not create another artifact solely to restate these fields.

Before task creation, handoff, or resumption, confirm its actual host/project/cwd and history. Metadata does not establish the user's location or requested device. Resume the same owner after interruption if its objective remains active; do not duplicate delayed work. A user correction changes only the affected scope unless they cancel or replace the objective.

An interrupted wait or new input alone does not require another status read. Check existing agent state only when a user request or concrete failure signal makes it necessary, and before a justified restart. A completed agent needs no restart. Reconcile a Heartbeat with current instructions and real unfinished work; it is a wake-up signal, not the source of truth. Fix stale automation only within the user's authorization.

## Waiting and liveness

Use the operation's native completion channel. For native agents, rely on automatically delivered completion events; do not periodically call list/read/status tools or repeat short `agents.wait_agent` calls. Do not replace one polling interval with another. While completion is pending, perform only independent work needed for the user's outcome. Read status again only for a user request or a concrete failure signal; elapsed time or a wait timeout alone is neither a signal nor permission to duplicate work. If higher-priority instructions limit blocking waits, use automatic completion delivery rather than a polling loop. These are operating rules, not a runtime enforcement mechanism; do not claim a technical guarantee that the available tools do not provide. For a running tool cell, use its provided wait/session mechanism. Preserve the user's ability to interrupt and provide meaningful updates under the active conversation instructions.

Use an event_waiter only when a long external operation has no suitable native completion channel and delegated observation is useful and permitted. Give it the exact observable operation/session, success and failure conditions, observation route, and return point. Do not create a monitor for a monitor or poll unchanged state from both parent and waiter.

For an external interactive CLI, its actual pane text distinguishes work from an input prompt. Read it before claiming progress; process existence, CPU time, empty inboxes, and unchanged output do not establish progress or failure. A confirmed exit, error, limit, or approval prompt needs recovery. Elapsed time alone is not failure unless the operation has an established deadline or timeout contract.

Before sending keys to a prompt, read all options and the selected item. Check the resulting model/route afterward. Do not accidentally change account, billing, permissions, or model by sending blind Enter/Escape. Preserve the specified route; report an unobservable state as unconfirmed.

## Goal and monitoring evidence

For a Codex automation requested at a local clock time, establish the scheduler's actual RRULE timezone and use [heartbeat_time.py](../scripts/heartbeat_time.py) to generate `BYHOUR` and `BYMINUTE` from the requested dated time. Wording such as “日本時間” in the prompt does not set the trigger timezone. After creation or update, pass the saved RRULE and its automation ID to the helper with `--check-rrule` and `--automation-id`. It reads the native scheduler database read-only and compares the persisted next run with the requested instant, including for YEARLY rules; it does not certify the schedule by recalculating the same input. Missing or mismatched scheduler evidence is a failed verification, not a reason to substitute a local calculation. A matching next run verifies scheduling only: verify actual firing and delivery to the responsible task separately before claiming that observation occurred. If the scheduler timezone or first fire cannot be established, do not claim that a time-critical monitor is armed. Diagnose a missed Codex heartbeat at the scheduling layer before changing the observed app.

A running external process does not prove that the Codex Goal or its observation path is active. Before reporting the current Goal status, read that same thread's native Goal state; do not reuse an earlier status or infer it from a PID. If the user reports that the Codex task stopped, inspect that layer first instead of rebutting it with the external process log. Distinguish observed state from the cause of a change; identify a blocking operation only from its actual history.

Scheduled waiting and unchanged observations are not, by themselves, an impasse. Apply the native Goal tool's actual blocking conditions; do not block merely to end waiting. When those conditions require blocking, report the returned state accurately rather than promise to keep it active. A requested resumption must use the same Goal's supported resumption mechanism and be verified; never substitute a new Goal or edit its database. If the available tools cannot resume it, state that concrete limitation without claiming it resumed.

Before claiming monitoring is in place for a time-critical operation, establish the observation route, deadline, and delivery of completion or actionable failure to the responsible task. A launch acknowledgement or a status file alone is not evidence that failure will reach that task. Use the existing native completion channel or authorized observer, and act on failures while recovery remains possible. Repeated “continuing” final messages do not provide monitoring or keep a Goal alive.


## 他スレッドと作業境界

- 他スレッドへの作成・送信・移管・再開では、関係する会話を必要な後続発言まで読み、実状態と来歴、送信先・内容への許可を確認します。要約やメタデータで本人の所在・操作主体・許可を推測しません。既存作業は同じスレッドとセッションで続け、重複作成で不一致を隠しません。引渡しの完了には受領の証拠が必要です。

- 新規・別スレッドへ明示的に分離した作業はそこで進めます。元スレッドでは重複実行、読取り、状態確認、待機、追加指示・Goal・認証情報の送信、移管先UI操作をせず、重複するGoalを停止・一時停止します。移管先は取り消しません。元からの再関与は明示依頼の範囲だけです。完了通知は受信できますが再関与の許可ではありません。この境界は元スレッドの別作業へ広げず、ユーザーには「新規／別スレッド」と呼びます。

## Heartbeat・Goal

- Heartbeatでは最新指示と実状態から再開します。サブエージェントの自動完了通知を待ち、定期的な一覧取得や短い待機の反復をしません。再確認はユーザーの要求か具体的な障害がある時に限り、待機中は独立した必要作業を進めます。

- Goalの作成・変更・再開依頼は実操作と状態の読戻しまで行い、宣言だけで済ませません。誤停止は同じGoalを正式に再開し、対象の訂正は既存Goalにも反映します。単一ツールの失敗や機能不足で再開不能と断言せず、`$codex-work-orchestration` と現在の公式仕様から、Goalコマンド・app-serverを含む利用可能な正式経路を確認します。権限や状態変更の制約は守り、実行結果を確認した状態だけ報告します。Goalの稼働や監視の継続を成果達成・成功保証と混同しません。

## 常駐先・監視・返信待ち

- 常駐サービス、定期実行、長時間の監視・ポーリング・ログ記録など常時または長時間動かす処理は、特定の機体を既定にせず、Mac等の作業端末に常駐させません。端末の特定・接続は `$local-environment-routing` と該当スキルに従います。実行先を提案・決定する前に、ユーザーの指定、既存の配置先、現在の稼働状態、対象機器・ネットワークへの到達性を確認し、条件を満たす機体を選びます。監視は観測源・経路・主体・期間・間隔またはイベントを定め、状態不変を理由に追加確認しません。定期報告の指定がなければ変化・完了・失敗・本人操作の必要時だけ通知します。過剰通知や自動実行の診断は実送信・発火履歴を確認し、再現操作の回数・時刻・観測範囲と常駐処理を区別します。

- 外部へ送信した後の返信確認は、相手の処理に要する時間と通知経路を考慮します。送信直後の受信検索で結果が空でも、返信がないと確定したり、障害や別経路へ進む根拠にしたりしません。
