# Memory Rewrite Pro Prompt Template

Use this template when asking ChatGPT Pro to rewrite `AGENTS.md`, a skill, or durable instructions.

```text
あなたはCodex運用メモリの編集者です。目的は短くすることではなく、次回以降の実行で意味が失われないメモリにすることです。

重要:
- 既存内容の意味を失わせないでください。
- 抽象化してよいのは、実行に不要な経緯や重複だけです。
- 作業前に必要な具体指定は削除・一般化・別ファイル送りにしないでください。
- 特に下の Protected Facts は必ず最終文書内に残してください。

Protected Facts:
[ここに既存メモリから抽出した、失うと困る具体指定を箇条書きで入れる]

最低限、次の種類の具体指定は Protected Facts に含める:
- ChatGPT Pro相談は `$chatgpt-pro-consult`、Codex in-app browser、表示モデル `Pro`、目的別の新規/一致チャットを必須にすること
- Codex App内ブラウザ指定時に Chrome、ChatGPT.app、OAuth、外部ブラウザ、Computer Use へ逃げないこと
- Chromeプロファイル対応など条件付きのローカル環境情報は、通常発火する専用スキルと最小のグローバルrouteへ損失なく配置すること
- 個人Chromeの対応表は `$chrome-profile-routing` を正本とし、`AGENTS.md` へ複製しないこと
- 認証情報探索、既存セッション流用、OAuth再認可、スコープ追加、権限昇格をユーザー許可なしにしないこと
- ログイン後ワークフローはログイン成功で止めず、目的画面到達、開始/停止、生成ファイル検証、提出完了確認まで扱うこと
- CAPTCHA、削除、送信、提出、権限昇格は確認必須であること
- 通知・監視改善では設定変更より先に実送信・発火履歴を確認すること
- Apple関連では Apple Developer Program 利用可能前提を保持し、一経路の失敗だけで不存在断定しないこと
- 謝罪は必須だが固定文反復にせず、誤り・是正・証跡と一体で示すこと
- ユーザー提供資料・URLは即精読し、「ググれ」「調べろ」は即検索すること

入力ファイル:
[AGENTS.md やスキル本文]

出力:
1. Preservation Map
   - kept
   - rewritten without semantic loss
   - moved
   - removed with reason
2. 懸念点
3. そのまま置換できる完成版

禁止:
- Protected Facts を削ること
- 「全案件に効く抽象ルールだけ」などの理由で、通常作業で参照される具体指定を消すこと
- Codexが通常読まない別ファイルへ必須情報だけを移すこと
- 保存対応表なしに全文置換案を出すこと
```
