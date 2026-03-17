"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TEXT } from "@/app/lib/text";

interface Recipient {
  id: string;
  name: string;
  school: string;
  school_short?: string;
  idol_id: string | null;
  created_at: string;
  message_count: number;
  idol: {
    id: string;
    name: string;
    admin_name: string | null;
    display_name: string;
    status: string;
    created_at: string;
  } | null;
  invite: { code: string; status: string; suggested_name: string | null } | null;
}

interface Request {
  id: string;
  school: string;
  name: string;
  status: string;
  created_at: string;
  handled_at?: string;
}

interface ResetRequest {
  school: string;
  name: string;
  requested_at: string;
}

export default function AdminPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 宛先追加フォーム
  const [newName, setNewName] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newSchoolShort, setNewSchoolShort] = useState("");
  const [adding, setAdding] = useState(false);

  // 招待コード生成
  const [inviteTarget, setInviteTarget] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/idols");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setRecipients(data.recipients || []);
      setRequests(data.requests || []);
      setResetRequests(data.resetRequests || []);
    } catch {
      setError(TEXT.admin.fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSchool.trim() || !newSchoolShort.trim()) return;
    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/admin/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          school: newSchool.trim(),
          school_short: newSchoolShort.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || TEXT.admin.addFailed);
        setAdding(false);
        return;
      }
      setNewName("");
      setNewSchool("");
      setNewSchoolShort("");
      await fetchData();
    } catch {
      setError(TEXT.admin.addFailed);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteRecipient = async (id: string, name: string) => {
    if (!confirm(TEXT.admin.deleteConfirm(name))) return;
    if (!confirm(TEXT.admin.deleteConfirmFinal(name))) return;
    setError("");

    try {
      const res = await fetch(`/api/admin/recipients?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      await fetchData();
    } catch {
      setError(TEXT.admin.deleteFailed);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedCode("");
    setError("");

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: inviteTarget || null,
          force,
        }),
      });

      const data = await res.json();

      // 409: 未使用の招待コードが既に存在する場合の警告
      if (res.status === 409 && data.warning) {
        const proceed = confirm(data.warning);
        if (proceed) {
          // force=trueで再リクエスト
          await handleGenerateInvite(e, true);
          return;
        }
        setGenerating(false);
        return;
      }

      if (!res.ok) throw new Error("generate failed");
      setGeneratedCode(data.code);
      setInviteTarget("");
      await fetchData();
    } catch {
      setError(TEXT.admin.inviteFailed);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkRequestHandled = async (id: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "handled" }),
      });
      if (!res.ok) throw new Error("update failed");
      await fetchData();
    } catch {
      setError("リクエストの更新に失敗しました");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

      <div style={{ width: "100%", maxWidth: "600px", position: "relative", zIndex: 1 }}>
        <Link href="/" className="back-link">
          {TEXT.common.backToTop}
        </Link>

        {/* 管理画面ヘッダー */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h1 className="page-title">{TEXT.admin.title}</h1>
          <p className="page-subtitle">{TEXT.admin.subtitle}</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>{error}</div>
        )}

        {/* パスワードリセットリクエスト */}
        {resetRequests.length > 0 && (
          <div className="card" style={{ marginBottom: "16px" }}>
            <h2 className="admin-section-title">パスワードリセットリクエスト</h2>
            <div className="admin-table-wrapper">
              {resetRequests.map((req, i) => (
                <div key={i} className="admin-recipient-card">
                  <div className="admin-recipient-header">
                    <div>
                      <span className="admin-recipient-name">{req.name}</span>
                      <span className="admin-recipient-school">{req.school}</span>
                    </div>
                    <span className="admin-badge admin-badge-invited">要対応</span>
                  </div>
                  <div className="admin-recipient-details">
                    <span className="admin-detail-item" style={{ fontSize: "0.75rem" }}>
                      申請日: {new Date(req.requested_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 登録リクエスト */}
        {requests.length > 0 && (
          <div className="card" style={{ marginBottom: "16px" }}>
            <h2 className="admin-section-title">{TEXT.admin.requestsTitle}</h2>
            <div className="admin-table-wrapper">
              {requests.map((req) => (
                <div key={req.id} className="admin-recipient-card">
                  <div className="admin-recipient-header">
                    <div>
                      <span className="admin-recipient-name">{req.name}</span>
                      <span className="admin-recipient-school">{req.school}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {req.status === "pending" ? (
                        <>
                          <span className="admin-badge admin-badge-invited">{TEXT.admin.badgePending}</span>
                          <button
                            type="button"
                            className="admin-copy-btn"
                            onClick={() => handleMarkRequestHandled(req.id)}
                          >
                            {TEXT.admin.requestMarkHandled}
                          </button>
                        </>
                      ) : (
                        <span className="admin-badge admin-badge-registered">{TEXT.admin.badgeHandled}</span>
                      )}
                    </div>
                  </div>
                  <div className="admin-recipient-details">
                    <span className="admin-detail-item" style={{ fontSize: "0.75rem" }}>
                      {TEXT.admin.requestDate(new Date(req.created_at).toLocaleDateString("ja-JP"))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 宛先追加フォーム */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2 className="admin-section-title">{TEXT.admin.addRecipientTitle}</h2>
          <form onSubmit={handleAddRecipient}>
            <div className="form-group">
              <label className="form-label">{TEXT.admin.addNameLabel}</label>
              <input
                type="text"
                className="form-input"
                placeholder={TEXT.admin.addNamePlaceholder}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={adding}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{TEXT.admin.addSchoolLabel}</label>
              <input
                type="text"
                className="form-input"
                placeholder={TEXT.admin.addSchoolPlaceholder}
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                disabled={adding}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{TEXT.admin.addSchoolShortLabel}</label>
              <input
                type="text"
                className="form-input"
                placeholder={TEXT.admin.addSchoolShortPlaceholder}
                value={newSchoolShort}
                onChange={(e) => setNewSchoolShort(e.target.value)}
                disabled={adding}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? TEXT.admin.addSubmitting : TEXT.admin.addSubmitButton}
            </button>
          </form>
        </div>

        {/* 招待コード生成 */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2 className="admin-section-title">{TEXT.admin.inviteTitle}</h2>
          <form onSubmit={handleGenerateInvite}>
            <div className="form-group">
              <label className="form-label">{TEXT.admin.inviteTargetLabel}</label>
              <select
                className="form-input"
                value={inviteTarget}
                onChange={(e) => setInviteTarget(e.target.value)}
                disabled={generating}
              >
                <option value="">{TEXT.admin.inviteTargetDefault}</option>
                {recipients
                  .filter((r) => !r.idol && !r.invite)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}（{r.school}）
                    </option>
                  ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={generating}>
              {generating ? TEXT.admin.inviteSubmitting : TEXT.admin.inviteSubmitButton}
            </button>
          </form>

          {generatedCode && (
            <div className="admin-invite-result">
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)", marginBottom: "8px" }}>
                {TEXT.admin.inviteResultLabel}
              </p>
              <div className="admin-invite-code">
                <code>{generatedCode}</code>
                <button
                  type="button"
                  className="admin-copy-btn"
                  onClick={() => copyToClipboard(generatedCode)}
                >
                  {TEXT.admin.inviteCopyButton}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 宛先一覧 */}
        <div className="card">
          <h2 className="admin-section-title">{TEXT.admin.recipientListTitle}</h2>
          {recipients.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              {TEXT.admin.recipientListEmpty}
            </p>
          ) : (
            <div className="admin-table-wrapper">
              {recipients.map((r) => (
                <div key={r.id} className="admin-recipient-card">
                  <div className="admin-recipient-header">
                    <div>
                      <span className="admin-recipient-name">{r.name}</span>
                      <span className="admin-recipient-school">{r.school}</span>
                      {r.school_short && (
                        <span className="admin-recipient-school">（{r.school_short}）</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="admin-delete-btn"
                      onClick={() => handleDeleteRecipient(r.id, r.name)}
                    >
                      {TEXT.admin.deleteButton}
                    </button>
                  </div>
                  <div className="admin-recipient-details">
                    <span className="admin-detail-item">
                      {TEXT.admin.messageCount(r.message_count)}
                    </span>
                    <span className="admin-detail-item">
                      {TEXT.admin.ogStatusLabel}
                      {r.idol ? (
                        <span className="admin-badge admin-badge-registered">{TEXT.admin.badgeRegistered}</span>
                      ) : r.invite ? (
                        <span className="admin-badge admin-badge-invited">{TEXT.admin.badgeInvited}</span>
                      ) : (
                        <span className="admin-badge admin-badge-none">{TEXT.admin.badgeNone}</span>
                      )}
                    </span>
                    {r.idol?.admin_name && (
                      <span className="admin-detail-item" style={{ fontSize: "0.75rem" }}>
                        {TEXT.admin.adminNameLabel(r.idol.admin_name)}
                      </span>
                    )}
                    {r.invite && (
                      <span className="admin-detail-item" style={{ fontSize: "0.75rem" }}>
                        {TEXT.admin.inviteCodeLabel(r.invite.code)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
