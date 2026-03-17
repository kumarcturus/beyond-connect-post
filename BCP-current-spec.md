# Beyond Connect POST — 現行仕様書

最終更新: 2026-03-15

---

## 1. プロジェクト概要

**Beyond Connect POST** は、卒業したスクールアイドル（OG）にファンがメッセージを送れるウェブアプリ。

- 送信者はログイン不要（匿名でメッセージ送信可能）
- OG は学校名＋氏名＋パスワードでログインし、自分宛のメッセージを閲覧する
- 運営が管理画面で宛先マスタ・招待コード・アカウントを管理する

---

## 2. 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) + TypeScript + React 19 |
| スタイル | CSS のみ（Tailwind 不使用）、`app/globals.css` に集約 |
| DB | Redis（`ioredis`）|
| 認証 | Cookie ベース、パスワードは bcrypt ハッシュ |
| デプロイ | Vercel |
| 本番URL | https://beyond-connect-post.vercel.app/ |

---

## 3. ページ一覧と画面仕様

### 3.1 トップページ `/`
- ヒーローアイコン・タイトル「Beyond Connect POST」
- 2つのボタン：「✉️ メッセージを送る」→ `/send`、「🎤 スクールアイドルOGログイン」→ `/login`
- フッター表示

### 3.2 メッセージ送信ページ `/send`
- **宛先選択**: 検索ボックスで氏名・学校名を検索、お気に入り（⭐）・最近使用（🕐）の履歴あり（localStorageに保存）
- **ニックネーム入力**: 送信者のニックネーム（任意テキスト）
- **メッセージ本文**: 1000文字以内（3層バリデーション：HTML maxLength、JS、サーバーAPI）、文字数カウンター付き
- **送信成功画面**: 送信後に「💌 送信しました！」画面を表示
- ログイン不要（匿名送信）

### 3.3 OGログインページ `/login`
- **学校名**: プルダウン選択（登録済み学校の一覧をAPIから取得）
- **氏名**: テキスト入力
- **パスワード**: テキスト入力
- ログイン成功 → `/dashboard` へリダイレクト
- 下部リンク:
  - 「招待コードをお持ちの方はこちらから登録」→ `/register`
  - 「アカウント登録をリクエスト」→ `/request`

### 3.4 OG登録ページ `/register`
- **招待コード**: テキスト入力
- **学校名**: プルダウン選択（登録済み学校一覧）
- **氏名**: テキスト入力
- **パスワード**: 8文字以上、確認入力あり
- 登録成功 → `/login?registered=1` へリダイレクト（成功メッセージ表示）

### 3.5 アカウント登録リクエストページ `/request`（新規）
- **学校名**: テキスト自由入力（未登録の学校も入力可能）
- **氏名**: テキスト入力
- 送信 → Redisに保存、管理画面に表示される
- 成功画面:「運営が確認後、招待コードをお届けします。しばらくお待ちください。」

### 3.6 OGダッシュボード `/dashboard`
- ログイン中のOG宛のメッセージ一覧を表示（新しい順）
- 各メッセージ: ニックネーム・本文・日時、クリックで展開/折りたたみ
- ログアウトボタン
- 未認証の場合 → `/login` へリダイレクト

### 3.7 管理画面 `/admin`（URLダイレクトアクセスのみ）
- **登録リクエスト一覧**: 未対応/対応済の切り替えボタン付き
- **宛先追加フォーム**: 氏名＋学校名＋学校名略称を入力して登録
- **招待コード生成**: 宛先を選択して招待コードを生成、コピーボタン付き
- **宛先一覧**: 各宛先のメッセージ数・OG登録ステータス（登録済/招待済/未招待）・管理名・招待コード表示、削除ボタン

---

## 4. アカウント管理の仕組み

### 4.1 名前の体系

| 用途 | 形式 | 例 |
|------|------|-----|
| **氏名** | OG登録時・ログイン時に入力 | 大沢瑠璃乃 |
| **学校名** | 正式名称（管理画面で登録） | 私立蓮ノ空女学院 |
| **学校名略称** | 管理画面で手動入力 | 蓮ノ空 |
| **管理名（admin_name）** | 略称＋氏名で自動生成 | 蓮ノ空 大沢瑠璃乃 |
| **表示名（display_name）** | 氏名がそのまま使われる | 大沢瑠璃乃 |

### 4.2 OGアカウント登録フロー

#### パターンA: 事前登録（サービス開始前）
1. 運営が管理画面で宛先を追加（氏名＋学校名＋学校名略称）
2. 運営が招待コードを生成（宛先にリンク）
3. 運営が招待コードをOG本人に配布
4. OG本人が `/register` で招待コード＋学校名選択＋氏名＋パスワードを入力して登録
5. **本登録前でもメッセージは蓄積される**（宛先マスタに紐づいているため）

#### パターンB: リクエスト登録（他校のOG向け）
1. OG本人が `/request` から学校名＋氏名を入力してリクエスト送信
2. 管理者が管理画面でリクエストを確認
3. 管理者が管理画面で宛先を追加し、招待コードを生成
4. 管理者がスクコネポスト（外部サービス）で招待コードをOGに送付
5. OG本人が `/register` で登録

### 4.3 ログイン認証
- **キー**: 学校名（プルダウン）＋氏名＋パスワード
- **Redisマッピング**: `bcp:idol_login:{学校名}:{氏名}` → `idol_id`
- **セッション**: `idol_session` Cookie に `idol_id` を格納（7日間有効、httpOnly）

---

## 5. API一覧

### 5.1 公開API（認証不要）

| エンドポイント | メソッド | 概要 |
|---------------|---------|------|
| `POST /api/send` | POST | メッセージ送信（receiver_id, sender_nickname, body） |
| `GET /api/recipients/search?q=` | GET | 宛先検索（名前・学校名で部分一致） |
| `GET /api/schools` | GET | 登録済み学校一覧（[{name, short}]） |
| `POST /api/register` | POST | OGアカウント登録（invite_code, school, name, password） |
| `POST /api/idol-login` | POST | OGログイン（school, name, password） |
| `POST /api/request` | POST | アカウント登録リクエスト送信（school, name） |

### 5.2 認証必要API

| エンドポイント | メソッド | 認証 | 概要 |
|---------------|---------|------|------|
| `GET /api/messages` | GET | OGセッション | ログイン中OG宛のメッセージ取得 |
| `POST /api/admin/recipients` | POST | Admin | 宛先追加（name, school, school_short） |
| `DELETE /api/admin/recipients?id=` | DELETE | Admin | 宛先削除（連動：OGアカウント・ログインキー・招待コードも削除） |
| `POST /api/admin/invite` | POST | Admin | 招待コード生成 |
| `GET /api/admin/idols` | GET | Admin | 管理データ一覧（宛先・OG・招待・リクエスト） |
| `GET /api/admin/requests` | GET | Admin | 登録リクエスト一覧 |
| `PATCH /api/admin/requests` | PATCH | Admin | リクエストステータス更新 |

---

## 6. データモデル（Redis）

### 6.1 宛先（Recipient）
```json
{
  "id": "rcpt_xxxxxxxx",
  "name": "大沢瑠璃乃",
  "school": "私立蓮ノ空女学院",
  "school_short": "蓮ノ空",
  "idol_id": "idol_xxxxxxxx" | null,
  "created_at": "2026-03-15T..."
}
```

### 6.2 OGアカウント（Idol）
```json
{
  "id": "idol_xxxxxxxx",
  "name": "大沢瑠璃乃",
  "school": "私立蓮ノ空女学院",
  "school_short": "蓮ノ空",
  "admin_name": "蓮ノ空 大沢瑠璃乃",
  "display_name": "大沢瑠璃乃",
  "password_hash": "$2a$10$...",
  "status": "registered",
  "created_at": "2026-03-15T..."
}
```

### 6.3 メッセージ（Message）
```json
{
  "id": "msg_xxxxxxxx",
  "receiver_id": "rcpt_xxxxxxxx",
  "sender_nickname": "ファンの名前",
  "body": "メッセージ本文（1000文字以内）",
  "timestamp": "2026-03-15T..."
}
```

### 6.4 招待コード（Invite）
```json
{
  "code": "abcdefghijkl",
  "suggested_name": "大沢瑠璃乃" | null,
  "recipient_id": "rcpt_xxxxxxxx" | null,
  "status": "pending" | "used",
  "idol_id": "idol_xxxxxxxx",
  "created_at": "2026-03-15T...",
  "used_at": "2026-03-15T..."
}
```

### 6.5 登録リクエスト（Request）
```json
{
  "id": "req_xxxxxxxx",
  "school": "私立結ヶ丘女子高等学校",
  "name": "澁谷かのん",
  "status": "pending" | "handled",
  "created_at": "2026-03-15T...",
  "handled_at": "2026-03-15T..."
}
```

### 6.6 Redisキー一覧

| キーパターン | 型 | 説明 |
|---|---|---|
| `beyond_connect_messages` | List | 全メッセージ（JSON配列） |
| `bcp:recipient:{rcpt_id}` | String (JSON) | 宛先データ |
| `bcp:recipient_list` | Set | 全宛先ID |
| `bcp:invite:{code}` | String (JSON) | 招待コードデータ |
| `bcp:invite_list` | Set | 全招待コード |
| `bcp:idol:{idol_id}` | String (JSON) | OGアカウントデータ |
| `bcp:idol_login:{school}:{name}` | String | 学校名+氏名 → idol_id マッピング |
| `bcp:request:{req_id}` | String (JSON) | 登録リクエスト |
| `bcp:request_list` | Set | 全リクエストID |

---

## 7. 認証の仕組み

| 認証レイヤー | 方式 | Cookie名 | 用途 |
|-------------|------|----------|------|
| サイト全体ゲート | `ADMIN_PASSWORD` 環境変数と照合 | `admin_gate` | サービス公開前のアクセス制限 |
| OGログイン | bcrypt パスワード照合 | `idol_session`（7日間） | OGダッシュボードへのアクセス |
| Admin API | `admin_gate` Cookie を `ADMIN_PASSWORD` と照合 | `admin_gate` | 管理API保護 |

---

## 8. ファイル構成

```
app/
├── page.tsx                    # トップページ
├── send/page.tsx               # メッセージ送信
├── login/page.tsx              # OGログイン
├── register/page.tsx           # OG登録
├── request/page.tsx            # 登録リクエスト
├── dashboard/page.tsx          # OGダッシュボード
├── admin/page.tsx              # 管理画面
├── layout.tsx                  # ルートレイアウト（Gate含む）
├── actions.ts                  # Gate用サーバーアクション
├── globals.css                 # 全スタイル
├── lib/
│   ├── redis.ts                # Redis接続・ユーティリティ
│   └── text.ts                 # UI文言一元管理
├── components/
│   └── Gate.tsx                # サイト全体認証ゲート
└── api/
    ├── send/route.ts           # メッセージ送信API
    ├── schools/route.ts        # 学校一覧API
    ├── request/route.ts        # 登録リクエストAPI
    ├── register/route.ts       # OG登録API
    ├── idol-login/route.ts     # OGログインAPI
    ├── messages/route.ts       # メッセージ取得API
    ├── recipients/
    │   └── search/route.ts     # 宛先検索API
    └── admin/
        ├── recipients/route.ts # 宛先管理API
        ├── invite/route.ts     # 招待コード生成API
        ├── idols/route.ts      # 管理データ一覧API
        └── requests/route.ts   # リクエスト管理API
```

---

## 9. UI文言管理

- すべてのUI文言は `app/lib/text.ts` に集約
- 文言変更は `text.ts` のみ修正すればOK
- 改行は `\n` を使い、表示側で `className="pre-line"` を付ける
- 動的な値（名前など）はアロー関数で定義

---

## 10. デザインルール

- **テーマ**: 海・さざ波（パステルカラー＋グラスモーフィズム）
- **フォント**: Zen Maru Gothic
- **カードUI**: 半透明白背景 + backdrop-filter blur
- **レスポンシブ**: モバイルファースト（480pxブレークポイント）
- **アニメーション**: さざ波（wave）、浮遊（float）、フェードイン（fadeInUp）

---

## 11. サービス開始前の準備手順

1. 管理画面 `/admin` にアクセス
2. 「宛先を追加」で蓮ノ空3人を登録
   - 例: 氏名「日野下花帆」、学校名「私立蓮ノ空女学院」、学校名略称「蓮ノ空」
3. 各宛先に対して「招待コードを生成」
4. 生成された招待コードを本人に配布
5. 本人が `/register` で登録（招待コード＋学校名選択＋氏名＋パスワード設定）
6. ログイン可能になる（本登録前でもメッセージは蓄積される）

---

## 12. 現在のステータス

- ✅ 全ページ実装済み（トップ、送信、ログイン、登録、リクエスト、ダッシュボード、管理画面）
- ✅ 全API実装済み（17エンドポイント）
- ✅ UI文言一元管理（text.ts）
- ✅ アカウント管理体系（管理名/表示名、学校名略称）
- ✅ 登録リクエスト機能
- ✅ 宛先削除の連動処理（OGアカウント・招待コード・ログインキーも削除）
- ✅ メッセージ1000文字制限（3層バリデーション）
- ✅ ビルド成功確認済み
- ✅ Redisテストデータクリア済み（空の状態）
