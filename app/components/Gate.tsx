"use client";

import { useState } from "react";
import { verifyPassword } from "../actions";
import { useRouter } from "next/navigation";

export default function Gate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");

    const success = await verifyPassword(password);
    if (success) {
      router.refresh();
    } else {
      setError("パスワードが違います");
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: "center" }}>
      <div className="wave-bg" />
      <div className="card" style={{ maxWidth: "360px", zIndex: 10 }}>
        <h1 className="page-title" style={{ fontSize: "1.4rem", marginBottom: "8px" }}>🔐 アクセス制限</h1>
        <p className="page-subtitle" style={{ fontSize: "0.85rem", marginBottom: "20px" }}>
          このページは関係者専用です。パスワードを入力してください。
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "確認中..." : "入室する"}
          </button>
        </form>
      </div>
    </div>
  );
}
