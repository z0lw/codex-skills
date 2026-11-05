# codex-skills

[OpenAI Codex](https://github.com/openai/codex) で使っているスキル一式の公開版です。`~/.codex/skills` と `~/.agents/skills` にあるスキルを、個人情報（氏名、メールアドレス、所属、端末名、IPアドレス、個人用フォルダのパス、アカウントID など）だけを `<your-obsidian-vault>` のようなプレースホルダに置き換えて公開しています。それ以外の手順・規則・言い回しは作者の運用のままです。

多くのスキルは作者の環境（アカウント、ローカルのリポジトリ）に合わせて書かれています。プレースホルダの部分は利用者の環境に合わせて埋める必要があります。

関連: グローバルメモリ https://github.com/z0lw/codex-global-memory 、フック集 https://github.com/z0lw/codex-consent-hooks

## Codex に導入を頼む場合

下の文をコピーして Codex に貼り付けてください。下の「導入手順（Codex 向け）」に沿って導入できます。

```text
https://github.com/z0lw/codex-skills のスキルを、READMEの導入手順に沿って導入してください。
```

## 導入手順（Codex 向け）

1. 利用者に、どのスキルを入れるかを確かめる（下の一覧）。全部でもよい。
2. 選んだスキルのフォルダを `skills/` から `~/.codex/skills/` にコピーする。`agmsg` は `~/.agents/skills/` に置く。同名のスキルがすでにある場合は上書きせず、利用者に確かめる。
3. コピーしたスキルの中の `<...>` 形式のプレースホルダ（リポジトリの場所、ホスト名、アカウント名など）を利用者の環境に合わせて埋める。利用者の環境にない前提（特定のアカウントやサービス）を使うスキルは、利用者に要否を確かめる。
4. `codex-work-orchestration/references/user-work-preferences.md` は作者の委任先モデルの設定なので、利用者の使えるモデルに合わせて書き直す。
5. Codex を再起動し、スキル一覧に出ることを確認する。

## スキル一覧

| スキル | 説明（SKILL.md の description の冒頭） |
| --- | --- |
| `agmsg` | Cross-agent messaging via SQLite for explicitly requested agmsg use or communication with existing external CL… |
| `apology-and-repair` | ユーザーがCodex自身へ謝罪、反省、自己批判、身体動作で表された謝罪姿勢、指定した謝罪形式・強度、または強い発話上の受諾を明示的に要求した時、および直前のCodexの謝罪を不足・定型反復・コピペ・同じ冒頭・指定形式違反… |
| `audit-refusal` | Codexがこのユーザーの指示を断ろう・保留しよう・条件を付けようとしている時に使う。ユーザーが「なぜやらない」「逃げるな」「都合が良い」「やれ」と差し戻した時、同じ拒否を言い換えて繰り返している時、危険・規約・なりすま… |
| `chatgpt-pro-consult` | Consult ChatGPT Pro through the Codex in-app browser with strict route and model verification. Use when the cu… |
| `chatgpt-project-reader` | Open and read relevant ChatGPT Projects from the current Codex context. Use when the user asks Codex to inspec… |
| `chatgpt-research` | ユーザーがChatGPTに調査を依頼した時に使う。ChatGPTで検索させ、出典付きの回答を回収する。 |
| `chrome-profile-routing` | 個人Chromeの目的別profile候補と、login済みstate・tab・extensionを使う実接続経路を選ぶ。ユーザーがChrome操作を指定した時、または依頼達成に特定のChrome profile/pro… |
| `claude-worker` | Claude Code CLIでのレビュー・調査・実作業やCLI経由のFable直接相談が指定された時、または必要なモデル・実行環境をCodex内では利用できない時に、非対話で実行して証跡を回収する。Claude等のモデ… |
| `codex-work-orchestration` | Coordinate dependencies and shared ownership across workers, cross-thread or cross-host handoffs, and requeste… |
| `domain-modeling` | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a GLO… |
| `edit-global-memory` | グローバルメモリの改稿・整理・更新、および今後も適用する全案件共通の振る舞い・好みの恒久訂正に使う。読み取り・再読・内容確認・説明だけの依頼には使わない。成果物だけの個別修正や案件・特定スキルだけの変更は対象外。振る舞い… |
| `grilling` | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thin… |
| `imozuru` | 知らない分野にキャッチアップするとき、汎用的な言葉から界隈の用語・中心の人・場（学会・雑誌・個人ブログ・動画・リポジトリ・一覧）を特定し、 引用・リンク・著者を芋づる式にたどって、目当ての原文（論文も個人の記事や動画の字… |
| `japanese-slide-writing` | 日本語のスライドを作成・編集・推敲するとき、自然な表現、用語統一、比較軸、図と主張の整合を補う。既存のPresentations等と併用する文章品質スキル。一般の会話・メール・論文本文や、文章変更を伴わないスライド操作に… |
| `obsidian-codex-memo` | Save or retrieve lightweight standalone reminders and rough notes that do not belong to an existing project. D… |
| `search-x-with-safe-relay` | Search and inspect current Twitter/X posts, accounts, timelines, and search results through the local twitter_… |
| `yomiyasu` | 日本語の文章を作成・推敲するとき、AI特有の不自然な比喩、曖昧な主述関係、不要な前置きや装飾を直す。「読みやすくして」「自然な日本語にして」「AIっぽさをなくして」や、技術記事・業務文書・エッセイの文章調整に使う。スライ… |

他者が作ったスキルの出典とライセンスは [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を見てください。

## License

作者が書いたスキルは MIT です（[LICENSE](LICENSE)）。他者のスキルは各フォルダのライセンスに従います。
