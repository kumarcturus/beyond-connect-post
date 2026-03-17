"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEXT } from "@/app/lib/text";

interface Message {
  id: string;
  sender_nickname: string;
  receiver_id: string;
  body: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        setError(TEXT.dashboard.fetchError);
        return;
      }

      const data = await res.json();
      setMessages(data);
    } catch {
      setError(TEXT.dashboard.connectionError);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleLogout = () => {
    document.cookie = "idol_session=; path=/; max-age=0";
    router.push("/login");
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="wave-bg" />
        <div className="card">
          <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>{TEXT.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="wave-bg" />

      <div style={{ width: "100%", maxWidth: "500px", position: "relative", zIndex: 1 }}>
        {/* ヘッダー */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className="page-title" style={{ fontSize: "1.2rem", margin: 0 }}>
              {TEXT.dashboard.title}
            </h1>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid var(--color-ocean-light)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-main)",
              }}
            >
              {TEXT.dashboard.logoutButton}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>{error}</div>
        )}

        {/* メッセージ一覧 */}
        {messages.length === 0 ? (
          <div className="card">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{TEXT.dashboard.emptyIcon}</div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                {TEXT.dashboard.emptyMessage}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="card dashboard-message-card"
              style={{ marginBottom: "12px", cursor: "pointer" }}
              onClick={() => toggleExpand(msg.id)}
            >
              <div className="dashboard-message-header">
                <span className="dashboard-message-preview">
                  {expandedId === msg.id
                    ? msg.body
                    : msg.body.length > 50
                    ? msg.body.slice(0, 50) + "..."
                    : msg.body}
                </span>
              </div>
              <div className="dashboard-message-meta">
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {TEXT.dashboard.senderSuffix(msg.sender_nickname)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {formatDate(msg.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/" className="back-link">
            {TEXT.common.backToTop}
          </Link>
        </div>
      </div>
    </div>
  );
}
