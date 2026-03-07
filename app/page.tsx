import Link from "next/link";

export default function Home() {
  return (
    <div className="page-container">
      {/* さざ波背景 */}
      <div className="wave-bg" />

      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div className="card" style={{ textAlign: "center" }}>
          {/* アイコン */}
          <div className="hero-icon">🌊✉️</div>

          {/* タイトル */}
          <h1 className="page-title">Beyond Connect POST</h1>
          <p className="page-subtitle">
            スクールアイドルの卒業生に
            <br />
            メッセージを届ける場所
          </p>

          {/* ボタン */}
          <div className="btn-group">
            <Link href="/send" className="btn btn-primary" id="btn-send-message">
              ✉️ メッセージを送る
            </Link>
            <Link href="/login" className="btn btn-secondary" id="btn-idol-login">
              🎤 スクールアイドルログイン
            </Link>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          padding: "16px 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        Beyond Connect POST © 2026
      </footer>
    </div>
  );
}
