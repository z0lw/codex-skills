# codex-skills

[OpenAI Codex](https://github.com/openai/codex) で使っているスキルの公開版です。作者の運用に合わせて書いたものなので、全部入れるより、使い方に合うものだけを選んで入れることを勧めます。公開にあたり、個人情報（氏名、メールアドレス、所属、端末名、個人用フォルダのパス、アカウントID など）は `<your-obsidian-vault>` のようなプレースホルダに置き換えています。

関連: グローバルメモリ https://github.com/z0lw/codex-global-memory 、フック集 https://github.com/z0lw/codex-consent-hooks

## Codex に導入を頼む場合

下の文をコピーして Codex に貼り付けてください。Codex があなたの使い方を聞き、合うスキルを選んで理由とともに提案します。

```text
https://github.com/z0lw/codex-skills のスキルから、私の使い方に合うものを選んで導入してください。
```

貼り付ける前に、Codex の権限を「フルアクセス」にしてください。導入先の `~/.codex` は、最初の権限では Codex が書き換えられません。設定の手順は https://note.z0lw.com/z0lw/a49b5b4a-7502-4c80-b22c-c85fe5e15f73 の手順3にあります。

## 導入手順（Codex 向け）

1. 最初に利用者へ「スキルは、あなたの使い方に合うものを選んで提案しますね」と伝える。作業の前に、入力欄の下の権限が「フルアクセス」になっているかを確かめ、違えば上の手順を案内する。
2. 利用者が Codex を何に使っているか、何に困っているかを短く聞き、既存の `~/.codex/skills/` を確かめる。
3. 下の一覧と各 `SKILL.md` を読み、利用者に役立つスキルを数個に絞って、「〇〇をよくするなら、△△が合います」のように理由を添えて提案する。前提のツールやサービスがない利用者には、そのスキルを提案しない。
4. 利用者が選んだスキルのフォルダを `skills/` から `~/.codex/skills/` にコピーする。同名のスキルがすでにある場合は上書きせず、利用者に確かめる。「ほかの人のスキル」を選んだ時は、その上流の手順で入れる。
5. コピーしたスキルの中の `<...>` 形式のプレースホルダを利用者の環境に合わせて埋める。`codex-work-orchestration` を入れた場合、`references/user-work-preferences.md` は作者の委任先の設定なので、利用者の使えるモデルに合わせて書き直す。`edit-global-memory` を入れた場合、担当の役割設定（SKILL.md の 2.）を利用者のモデルで作る。
6. Codex を再起動し、スキル一覧に出ることを確認して、何を入れて何を見送ったかを短く報告する。

## スキル一覧

| スキル | 内容 | 向く人・前提 |
| --- | --- | --- |
| `chatgpt-project-reader` | ChatGPT のプロジェクトのチャットを、アプリ内ブラウザで開いて読む | ChatGPT のプロジェクトを使っている人 |
| `claude-worker` | Claude Code CLI に、レビュー・調査・作業を非対話で任せて結果を回収する | Claude Code CLI を使える人 |
| `codex-work-orchestration` | 複数の担当の依存関係、スレッドをまたぐ引き継ぎ、長い監視を調整する | 委任を多く使う人 |
| `deepseek-harness-worker` | DeepSeek Harness（DSH）のセッションに作業を任せ、結果を回収する | DSH を使っている人（アプリと `scripts/dsh-worker.mjs`） |
| `edit-global-memory` | グローバルメモリ（`~/.codex/AGENTS.md`）の恒久的な訂正と整理。容量の検査スクリプト付き | メモリを少しずつ育てていく人 |
| `imozuru` | 知らない分野を、用語・人・場から芋づる式にたどり、原文を保存する | 調査を深くしたい人（Python。動画の字幕やPDFには yt-dlp、pdftotext、tesseract） |
| `japanese-slide-writing` | 日本語のスライドの見出し、用語、比較表、図と主張の整合を推敲する | 日本語でスライドを作る人 |
| `obsidian-codex-memo` | Obsidian の保管庫に短いメモを残す・探す | Obsidian を使っている人（保管庫の場所を埋める） |

## ほかの人のスキル（上流から入れる）

作者が使っている、ほかの人のスキルです。更新に追いつけるよう、同梱せずに上流から入れます。入れ方は各リポジトリの README に従います。

| スキル | 内容 | 上流と入れ方 |
| --- | --- | --- |
| `agmsg` | Claude Code や Codex など、別々のエージェント同士でメッセージを送り合う | https://github.com/fujibee/agmsg （`npx agmsg`） |
| `yomiyasu` | AI が書いた日本語を自然な日本語に推敲する。`japanese-slide-writing` と組み合わせて使う | https://github.com/nanaism/yomiyasu （`npx skills add nanaism/yomiyasu`） |
| `domain-modeling` | 用語集（GLOSSARY.md）や設計判断の記録（ADR）を整える | https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling |
| `grilling` | 計画や判断を質問攻めにして詰める | https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling |

## License

MIT（[LICENSE](LICENSE)）。`japanese-slide-writing` は carnot-tech/consulting-pptx-skill の資料を参考に、判断基準を独自にまとめたものです（出典は SKILL.md に記載）。
