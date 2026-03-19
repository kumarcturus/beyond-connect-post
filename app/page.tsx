import Link from "next/link";
import Image from "next/image";
import { TEXT } from "@/app/lib/text";

export default function Home() {
  return (
    <div className="page-container">
      {/* さざ波背景 */}
      <div className="wave-bg" />

      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div className="card" style={{ textAlign: "center" }}>
          {/* ロゴ */}
          <Image
            src="/logo_toppage.png"
            alt={TEXT.top.title}
            width={560}
            height={280}
            className="hero-logo"
            priority
          />
          <p className="page-subtitle pre-line">
            {TEXT.top.subtitle}
          </p>

          {/* ボタン */}
          <div className="btn-group">
            <Link href="/send" className="btn btn-primary" id="btn-send-message">
              {TEXT.top.sendButton}
            </Link>
            <Link href="/login" className="btn btn-secondary" id="btn-idol-login" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <span style={{ fontSize: "0.7em", opacity: 0.85 }}>{TEXT.top.loginButtonSub}</span>
              <span>{TEXT.top.loginButtonMain}</span>
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
          padding: "12px 0",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <Link
          href="/terms"
          style={{
            color: "var(--color-text-muted)",
            textDecoration: "underline",
            fontSize: "0.9rem",
            fontWeight: 500,
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
