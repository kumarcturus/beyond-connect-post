"use client";

import { useState } from "react";
import Link from "next/link";

// TODO: 将来拡張
// - 生体認証ログイン
// - ログイン後のダッシュボード（受信メッセージ一覧）
// - 既読機能
// - ブックマーク機能

// MVPでは簡易認証（ハードコードユーザー）
const IDOL_USERS = [
  { nickname: "rurino", password: "rurino123" },
  { nickname: "kaho", password: "kaho123" },
  { nickname: "sayaka", password: "sayaka123" },
];

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginNickname, setLoginNickname] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim() || !password.trim()) {
      setError("ニックネームとパスワードを入力してください");
      return;
    }

    const user = IDOL_USERS.find(
      (u) => u.nickname === nickname.trim() && u.password === password.trim()
    );

    if (user) {
      setLoggedIn(true);
      setLoginNickname(user.nickname);
    } else {
      setError("ニックネームまたはパスワードが正しくありません");
    }
  };

  // ログイン後画面
  if (loggedIn) {
    return (
      <div className="page-container">
        <div className="wave-bg" />
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div className="card">
            <div className="success-container">
              <div className="success-icon">🎤</div>
              <h2 className="success-title">
                ようこそ、{loginNickname} さん！
              </h2>
              <p className="success-message">
                ログインに成功しました。
                <br />
                メッセージダッシュボードは今後実装予定です。
              </p>
              {/* TODO: 受信メッセージ一覧画面を実装 */}
              <div style={{ marginBottom: "12px" }}>
                <span className="future-badge">🔜 Coming Soon</span>
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "20px",
                  lineHeight: 1.6,
                }}
              >
                受信メッセージの閲覧・既読・ブックマーク機能は今後のアップデートで追加されます。
              </p>
              <Link href="/" className="btn btn-secondary">
                トップに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="wave-bg" />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* 戻るリンク */}
        <Link href="/" className="back-link">
          ← トップに戻る
        </Link>

        <div className="card">
          <h1 className="page-title">🎤 スクールアイドルログイン</h1>
          <p className="page-subtitle">
            届いたメッセージを確認しよう
          </p>

          {/* エラー表示 */}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            {/* ニックネーム */}
            <div className="form-group">
              <label htmlFor="nickname" className="form-label">
                ニックネーム
              </label>
              <input
                type="text"
                id="nickname"
                className="form-input"
                placeholder="例: rurino"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {/* パスワード */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-login"
            >
              ログイン
            </button>
          </form>

          {/* テスト用ヒント */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "rgba(254, 243, 199, 0.5)",
              borderRadius: "10px",
              fontSize: "0.75rem",
              color: "var(--color-text-light)",
              lineHeight: 1.6,
            }}
          >
            💡 テスト用アカウント
            <br />
            rurino / rurino123
            <br />
            kaho / kaho123
            <br />
            sayaka / sayaka123
          </div>
        </div>
      </div>
    </div>
  );
}
