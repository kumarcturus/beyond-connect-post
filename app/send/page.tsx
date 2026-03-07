"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// TODO: 将来拡張
// - 音声メッセージ送信機能
// - エンドツーエンド暗号化
// - X投稿共有ボタン

// スクールアイドル一覧（MVPではハードコード）
const IDOL_LIST = [
  { id: "kaho_hinoshita", name: "花帆" },
  { id: "sayaka_murano", name: "さやか" },
  { id: "rurino_osawa", name: "瑠璃乃" },
  { id: "kozue_otomune", name: "こずえ" },
  { id: "ginko_momose", name: "ぎんこ" },
  { id: "megumi_fujishima", name: "めぐみ" },
];

// お気に入り（MVPではハードコード、将来はlocalStorageで管理）
const FAVORITE_IDS = ["kaho_hinoshita", "sayaka_murano", "rurino_osawa"];

export default function SendPage() {
  const [receiverId, setReceiverId] = useState("");
  const [senderNickname, setSenderNickname] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // お気に入りアイドル
  const favorites = useMemo(
    () => IDOL_LIST.filter((idol) => FAVORITE_IDS.includes(idol.id)),
    []
  );

  // 検索結果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return IDOL_LIST;
    return IDOL_LIST.filter((idol) =>
      idol.name.includes(searchQuery.trim())
    );
  }, [searchQuery]);

  // 選択中のアイドル名を取得
  const selectedIdolName = useMemo(() => {
    const idol = IDOL_LIST.find((i) => i.id === receiverId);
    return idol ? idol.name : "";
  }, [receiverId]);

  const handleSelectIdol = (idolId: string) => {
    setReceiverId(idolId);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!receiverId) {
      setError("宛先を選んでください");
      return;
    }
    if (!senderNickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }
    if (!body.trim()) {
      setError("メッセージを入力してください");
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
        throw new Error("送信に失敗しました");
      }

      setSent(true);
    } catch {
      setError("送信に失敗しました。もう一度お試しください。");
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
              <div className="success-icon">💌</div>
              <h2 className="success-title">送信しました！</h2>
              <p className="success-message">
                あなたの想いは{selectedIdolName}に届けられました。
                <br />
                きっと届きます。
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
          <h1 className="page-title">✉️ メッセージを送る</h1>
          <p className="page-subtitle">
            想いを言葉にして届けよう
          </p>

          {/* エラー表示 */}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* 宛先セクション */}
            <div className="form-group">
              <label className="form-label">宛先</label>

              {/* 選択済み表示 */}
              {receiverId && (
                <div className="receiver-selected">
                  <span className="receiver-selected-name">
                    💐 {selectedIdolName}
                  </span>
                  <button
                    type="button"
                    className="receiver-selected-clear"
                    onClick={() => setReceiverId("")}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 未選択時: 検索 + お気に入り */}
              {!receiverId && (
                <>
                  {/* 検索バー */}
                  <div className="receiver-search-wrapper">
                    <input
                      type="text"
                      className="form-input receiver-search-input"
                      placeholder="🔍 名前で検索"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearch(true);
                      }}
                      onFocus={() => setShowSearch(true)}
                    />
                    {/* 検索結果ドロップダウン */}
                    {showSearch && searchQuery.trim() && (
                      <div className="receiver-search-results">
                        {searchResults.length > 0 ? (
                          searchResults.map((idol) => (
                            <button
                              key={idol.id}
                              type="button"
                              className="receiver-search-item"
                              onClick={() => handleSelectIdol(idol.id)}
                            >
                              {idol.name}
                            </button>
                          ))
                        ) : (
                          <div className="receiver-search-empty">
                            見つかりませんでした
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* お気に入り */}
                  <div className="receiver-favorites">
                    <span className="receiver-favorites-label">⭐ お気に入り</span>
                    <div className="receiver-favorites-list">
                      {favorites.map((idol) => (
                        <button
                          key={idol.id}
                          type="button"
                          className="receiver-favorite-chip"
                          onClick={() => handleSelectIdol(idol.id)}
                        >
                          {idol.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 送信者ニックネーム */}
            <div className="form-group">
              <label htmlFor="senderNickname" className="form-label">
                ニックネーム
                <span className="form-label-sub">（あなたの名前）</span>
              </label>
              <input
                type="text"
                id="senderNickname"
                className="form-input"
                placeholder="例：はすの空ファン"
                value={senderNickname}
                onChange={(e) => setSenderNickname(e.target.value)}
                disabled={sending}
              />
            </div>

            {/* 本文 */}
            <div className="form-group">
              <label htmlFor="body" className="form-label">
                メッセージ
              </label>
              <textarea
                id="body"
                className="form-input"
                placeholder="伝えたい想いを書いてください"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={sending}
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-submit-message"
              disabled={sending}
            >
              {sending ? "送信中..." : "💫 メッセージを送る"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
