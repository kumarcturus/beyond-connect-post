import Link from "next/link";
import { TEXT } from "@/app/lib/text";

export default function Home() {
  return (
    <div className="page-container">
      {/* さざ波背景 */}
      <div className="wave-bg" />

      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div className="card" style={{ textAlign: "center" }}>
          {/* アイコン */}
          <div className="hero-icon">{TEXT.top.icon}</div>

          {/* タイトル */}
          <h1 className="page-title">{TEXT.top.title}</h1>
          <p className="page-subtitle pre-line">
            {TEXT.top.subtitle}
          </p>

          {/* ボタン */}
          <div className="btn-group">
            <Link href="/send" className="btn btn-primary" id="btn-send-message">
              {TEXT.top.sendButton}
            </Link>
            <Link href="/login" className="btn btn-secondary" id="btn-idol-login">
              {TEXT.top.loginButton}
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
        <Link
          href="/terms"
          style={{
            color: "var(--color-text-muted)",
            textDecoration: "underline",
            fontSize: "0.75rem",
          }}
        >
          {TEXT.top.termsLink}
        </Link>
        <span style={{ margin: "0 8px" }}>|</span>
        {TEXT.top.footer}
      </footer>
    </div>
  );
}
