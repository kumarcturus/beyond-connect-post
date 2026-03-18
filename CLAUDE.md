# Beyond Connect POST — CLAUDE.md

## プロジェクト概要

卒業したスクールアイドル（OG）にメッセージを送れる Next.js ウェブアプリ。
送信者はログイン不要。OG はログインして自分宛のメッセージを閲覧する。

- **フレームワーク:** Next.js 16 (App Router) + TypeScript + React 19
- **スタイル:** CSS のみ（Tailwind 不使用）、`app/globals.css` にすべて集約
- **DB:** Redis (`ioredis`)、環境変数 `REDIS_URL` または `KV_URL`
- **認証:** Cookie ベース、パスワードは bcrypt ハッシュ
- **デプロイ:** Vercel
- **本番:** https://beyond-connect-post.vercel.app/

## 開発コマンド

```bash
npm run dev    # ローカル開発サーバー (http://localhost:3000)
npm run build  # 本番ビルド
npm start      # 本番サーバー起動
```

## ディレクトリ構成ルール

- ページ: `app/{route}/page.tsx`
- API: `app/api/{endpoint}/route.ts`
- 共通ライブラリ: `app/lib/`
- コンポーネント: `app/components/`

## コーディング規約

- **日本語 UI:** ユーザー向けテキストはすべて日本語
- **モバイルファースト:** すべてのページはスマホ画面で正しく表示されること
- **CSS:** 既存の globals.css のカードUI・パステルカラー・グラスモーフィズムを踏襲する。Tailwind や新しい CSS フレームワークを導入しない
- **Redis 接続:** `app/lib/redis.ts` の共通インスタンスを使う
- **ID 生成:** `{prefix}_` + ランダム英数字8文字（例: `msg_a1b2c3d4`, `idol_x9y8z7w6`）
- **パスワード:** 平文で保存しない。必ず bcrypt ハッシュ化。クライアントサイドにパスワードを置かない
- **エラーメッセージ:** API は JSON `{ error: "メッセージ" }` で返す

## Redis キースキーマ

| キーパターン | 型 | 説明 |
|---|---|---|
| `beyond_connect_messages` | List | 全メッセージ |
| `bcp:recipient:{rcpt_id}` | String (JSON) | 宛先マスタデータ（name, school, school_short, idol_id） |
| `bcp:recipient_list` | Set | 全宛先 ID |
| `bcp:invite:{code}` | String (JSON) | 招待コードデータ |
| `bcp:invite_list` | Set | 全招待コード |
| `bcp:idol:{idol_id}` | String (JSON) | OG アカウントデータ（name, school, school_short, admin_name, display_name） |
| `bcp:idol_login:{school}:{name}` | String | 学校名+氏名 → idol_id マッピング |
| `bcp:request:{req_id}` | String (JSON) | アカウント登録リクエスト |
| `bcp:request_list` | Set | 全リクエスト ID |

## 認証パターン

- **サイト全体ゲート:** `ADMIN_PASSWORD` 環境変数 + `admin_gate` Cookie（`app/components/Gate.tsx`）
- **OG ログイン:** `idol_session` Cookie に idol_id を格納
- **Admin API:** `admin_gate` Cookie を `ADMIN_PASSWORD` と照合

## 触ってはいけないファイル（明示的に指示がない限り）

- `app/layout.tsx` — ルートレイアウト + Gate
- `app/actions.ts` — Gate 用サーバーアクション
- `app/components/Gate.tsx` — Gate コンポーネント

## UI文言の管理

- すべてのUI文言は `app/lib/text.ts` に集約
- 文言を変更する場合は `text.ts` のみ修正する
- 改行は `\n` を使い、表示側で `className="pre-line"` を付ける

## 参照ドキュメント

- 実装仕様: `BCP-implementation-spec.md`（Phase 1 の詳細仕様）

## ブランチ・公開方針

- **ブランチ:** `main` ブランチ1本で開発中（`production` ブランチは存在しない）
- **リポジトリ:** GitHub Public で公開済み（誰でもコードを閲覧できる状態）
- そのため、秘密情報をコードにベタ書きすることは絶対に禁止

## セキュリティルール（必ず守ること）

### 絶対にやってはいけないこと
- `.env` / `.env.local` / `.env.production` などの環境変数ファイルをGitにcommit・pushしない
- APIキー、シークレットキー、パスワードをソースコード中に直接書かない（ハードコードしない）
- これらの値をチャットやコメントに貼り付けない

### 機密情報の正しい扱い方
- 機密情報は必ず `.env` ファイルに書き、コードからは `process.env.VARIABLE_NAME` で参照する
- `.gitignore` に `.env*` が含まれていることを確認してから作業する

### pushしてはいけないファイル（.gitignoreで管理）
- `.env` / `.env.local` / `.env.production`
- `node_modules/`
- `.next/`
- `*.log`
