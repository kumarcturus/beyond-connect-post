"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { TEXT } from "@/app/lib/text";

interface Recipient {
  id: string;
  name: string;
  school: string;
}

function loadFromStorage(key: string): Recipient[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(key: string, data: Recipient[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function SendPage() {
  const [receiverId, setReceiverId] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [senderNickname, setSenderNickname] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // 検索
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // お気に入り・最近
  const [favorites, setFavorites] = useState<Recipient[]>([]);
  const [recent, setRecent] = useState<Recipient[]>([]);

  useEffect(() => {
    setFavorites(loadFromStorage("bcp_favorites"));
    setRecent(loadFromStorage("bcp_recent"));
  }, []);

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (recipient: Recipient) => {
    let updated: Recipient[];
    if (isFavorite(recipient.id)) {
      updated = favorites.filter((f) => f.id !== recipient.id);
    } else {
      updated = [...favorites, recipient];
    }
    setFavorites(updated);
    saveToStorage("bcp_favorites", updated);
  };

  const searchRecipients = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/recipients/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      // 検索エラーは無視
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearch(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchRecipients(value);
    }, 300);
  };

  const handleSelectRecipient = async (recipient: Recipient) => {
    setError("");
    // 宛先がまだ存在するかAPIで確認
    try {
      const res = await fetch(`/api/recipients/search?q=${encodeURIComponent(recipient.name)}`);
      if (res.ok) {
        const data: Recipient[] = await res.json();
        const exists = data.some((r) => r.id === recipient.id);
        if (!exists) {
          // 存在しない → お気に入り・最近から削除
          const updatedFav = favorites.filter((f) => f.id !== recipient.id);
          setFavorites(updatedFav);
          saveToStorage("bcp_favorites", updatedFav);
          const updatedRecent = recent.filter((r) => r.id !== recipient.id);
          setRecent(updatedRecent);
          saveToStorage("bcp_recent", updatedRecent);
          setError("この宛先は現在利用できません");
          return;
        }
      }
    } catch {
      // ネットワークエラー時はそのまま選択を許可（送信時にサーバー側で弾く）
    }
    setReceiverId(recipient.id);
    setSelectedRecipient(recipient);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleClearRecipient = () => {
    setReceiverId("");
    setSelectedRecipient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!receiverId) {
      setError(TEXT.send.recipientNotSelected);
      return;
    }
    if (!senderNickname.trim()) {
      setError(TEXT.send.nicknameRequired);
      return;
    }
    if (!body.trim()) {
      setError(TEXT.send.messageRequired);
      return;
    }
    if (body.trim().length > TEXT.send.messageMaxLength) {
      setError(TEXT.send.messageTooLong);
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: receiverId,
          sender_nickname: senderNickname.trim(),
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("send failed");
      }

      // 最近の送信先を更新
      if (selectedRecipient) {
        const updatedRecent = [
          selectedRecipient,
          ...recent.filter((r) => r.id !== selectedRecipient.id),
        ].slice(0, 5);
        setRecent(updatedRecent);
        saveToStorage("bcp_recent", updatedRecent);
      }

      setSent(true);
    } catch {
      setError(TEXT.send.submitError);
    } finally {
      setSending(false);
    }
  };

  // 送信成功画面
  if (sent) {
    return (
      <div className="page-container">
        <div className="wave-bg" />
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div className="card">
            <div className="success-container">
              <div className="success-icon">{TEXT.send.successIcon}</div>
              <h2 className="success-title">{TEXT.send.successTitle}</h2>
              <p className="success-message pre-line">
                {TEXT.send.successMessage(selectedRecipient?.name ?? "")}
              </p>
              <Link href="/" className="btn btn-secondary">
                {TEXT.common.backToTop}
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
        <Link href="/" className="back-link">
          {TEXT.common.backToTop}
        </Link>

        <div className="card">
          <h1 className="page-title">{TEXT.send.title}</h1>
          <p className="page-subtitle">{TEXT.send.subtitle}</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* 宛先セクション */}
            <div className="form-group">
              <label className="form-label">{TEXT.send.recipientLabel}</label>

              {/* 選択済み表示 */}
              {selectedRecipient && (
                <div className="receiver-selected">
                  <span className="receiver-selected-name">
                    💐 {selectedRecipient.name}
                    <span className="form-label-sub" style={{ marginLeft: "6px" }}>
                      {selectedRecipient.school}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="receiver-selected-clear"
                    onClick={handleClearRecipient}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 未選択時 */}
              {!selectedRecipient && (
                <>
                  {/* 検索バー */}
                  <div className="receiver-search-wrapper">
                    <input
                      type="text"
                      className="form-input receiver-search-input"
                      placeholder={TEXT.send.recipientSearchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowSearch(true)}
                    />
                    {showSearch && searchQuery.trim() && (
                      <div className="receiver-search-results">
                        {searching ? (
                          <div className="receiver-search-empty">{TEXT.send.searching}</div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              className="receiver-search-item"
                              onClick={() => handleSelectRecipient(r)}
                            >
                              <span>{r.name}</span>
                              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginLeft: "8px" }}>
                                {r.school}
                              </span>
                              <span
                                className="star-btn"
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(r); }}
                                style={{ marginLeft: "auto" }}
                              >
                                {isFavorite(r.id) ? "★" : "☆"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="receiver-search-empty">
                            {TEXT.send.noResults}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* お気に入り */}
                  {favorites.length > 0 && (
                    <div className="receiver-favorites" style={{ marginTop: "12px" }}>
                      <span className="receiver-favorites-label">{TEXT.send.favoritesLabel}</span>
                      <div className="receiver-favorites-list">
                        {favorites.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className="receiver-favorite-chip"
                            onClick={() => handleSelectRecipient(r)}
                          >
                            {r.name}
                            <span
                              className="star-btn"
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(r); }}
                            >
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 最近の送信先 */}
                  {recent.length > 0 && (
                    <div className="receiver-favorites" style={{ marginTop: "12px" }}>
                      <span className="receiver-favorites-label">{TEXT.send.recentLabel}</span>
                      <div className="receiver-favorites-list">
                        {recent.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className="receiver-favorite-chip"
                            onClick={() => handleSelectRecipient(r)}
                          >
                            {r.name}
                            <span
                              className="star-btn"
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(r); }}
                            >
                              {isFavorite(r.id) ? "★" : "☆"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 送信者ニックネーム */}
            <div className="form-group">
              <label htmlFor="senderNickname" className="form-label">
                {TEXT.send.nicknameLabel}
                <span className="form-label-sub">{TEXT.send.nicknameSub}</span>
              </label>
              <input
                type="text"
                id="senderNickname"
                className="form-input"
                placeholder={TEXT.send.nicknamePlaceholder}
                value={senderNickname}
                onChange={(e) => setSenderNickname(e.target.value)}
                disabled={sending}
              />
            </div>

            {/* 本文 */}
            <div className="form-group">
              <label htmlFor="body" className="form-label">{TEXT.send.messageLabel}</label>
              <textarea
                id="body"
                className="form-input"
                placeholder={TEXT.send.messagePlaceholder}
                maxLength={TEXT.send.messageMaxLength}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={sending}
              />
              <div style={{
                textAlign: "right",
                fontSize: "0.75rem",
                marginTop: "4px",
                color: body.length > TEXT.send.messageMaxLength * 0.9
                  ? "var(--color-coral-deep)"
                  : "var(--color-text-muted)",
              }}>
                {body.length} / {TEXT.send.messageMaxLength}
              </div>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-submit-message"
              disabled={sending}
            >
              {sending ? TEXT.send.submitting : TEXT.send.submitButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
