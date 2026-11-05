---
name: chrome-profile-routing
description: 個人Chromeの目的別profile候補と、login済みstate・tab・extensionを使う実接続経路を選ぶ。ユーザーがChrome操作を指定した時、または依頼達成に特定のChrome profile/profileName・既存tab・browser account/sessionが実際に必要な時に使う。「私用」「<用途A>」「<用途B>」「AIエージェント」という語だけの通常作業や、connector/API/CLIで完結するsemantic readには使わない。
---

# Chrome Profile Routing

## 操作経路を選ぶ

1. 依頼がChrome routeを実際に必要とするかを先に判定する。意味的な読取・検索・状態取得は、ユーザーがChromeを明示した場合またはChrome固有UIが必要な場合を除き、該当コネクタ/API/CLIを先に使い、profile一覧やaccountを調べない。
2. Chromeを使う時は、そのセッションで提供されるbundled公式 `$chrome:control-chrome` を全文読み、操作正本として従う。plugin cacheは恒久正本として編集しない。
3. 削除済みのローカル `browser-use`、独立CDP、リモートデバッグ設定を使わない。Chromeの明示指定やChrome固有の状態が必要な作業では、公式経路の接続一覧・選択・復旧手順を確認する。対象profileが一覧にないことや別accountであることだけで、通常接続の不能やComputer Useの必要性を決めない。利用不能なら、その経路の未達を報告し、リモートデバッグやComputer Useへ黙って切り替えない。
4. Chromeの明示指定やChrome固有の状態が不要なブラウザ操作には、Codexアプリ内ブラウザを使える。Chromeが画面ロック等で操作できない場合も同様とし、`$browser:control-in-app-browser` に従う。ユーザーがin-app Browserを明示した場合は、Chromeのログイン状態で代用しない。

## プロファイル候補

| `profileName` | 表示名 | 用途 |
|---|---|---|
| `Default` | <表示名1> | 私用 |
| `Profile 3` | <表示名2> | <用途A> |
| `Profile 8` | <表示名3> | <用途B> |
| `Profile 11` | AIエージェント | AIエージェント用、ChatGPTログイン済み |

- 指定がなければ `Profile 11`、私用・個人・<表示名1>なら `Default` を候補にする。
- 明示されたprofile、表示名、用途を優先する。
- 表は候補であり、実接続、ログイン、対象account、OAuth、送信許可の証拠ではない。

## 接続を固定する

公式Chrome経路が提供する接続・タブ情報から、対象の実 `profileName`、instance、表示中accountを確認してから読む・操作する。プロファイル情報を取得できなければ候補だけで同一性を断定しない。

- 目的外instanceを読まない・操作しない。誤って作ったタブだけを閉じ、既存の無関係なタブを変更しない。
- account不一致、再ログイン、CAPTCHA、権限・OAuth、外部送信は、公式Chrome skillとグローバル承認境界に従う。
- Computer Useへ移る前に、必要な操作が通常Chrome接続ではできない実証と、その操作への許可を照合する。profileを開く準備操作にもこの条件を適用し、不要な起動・前面化・profileメニュー操作をしない。条件を満たす同一profile内UIだけ補完し、完了後はChromeへ戻って実ページを検証する。
- フォームはvisible DOMを優先し、座標クリックや連続撮影は必要な場合だけにする。ログイン後は目的状態まで確認し、静的testと実E2Eを区別する。
