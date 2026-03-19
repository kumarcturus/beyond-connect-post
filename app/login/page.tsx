"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TEXT } from "@/app/lib/text";

interface School {
  name: string;
  short: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [school, setSchool] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resetRequesting, setResetRequesting] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccessMessage(TEXT.login.registeredSuccess);
    }
  }, [searchParams]);

  // 学校一覧を取得
  useEffect(() => {
    fetch("/api/schools")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!school || !name.trim() || !password.trim()) {
      setError(TEXT.login.validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/idol-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school,
          name: name.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || TEXT.login.loginFailed);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError(TEXT.common.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="wave-bg" />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        <Link href="/" className="back-link">
          {TEXT.common.backToTop}
        </Link>

        <div className="card">
          <h1 className="page-title pre-line">{TEXT.login.title}</h1>
          <p className="page-subtitle">
            {TEXT.login.subtitle}
          </p>

          {successMessage && (
            <div style={{
              background: "rgba(134, 239, 172, 0.2)",
              border: "1px solid var(--color-success-deep)",
              color: "#166534",
              padding: "10px 14px",
              borderRadius: "var(--radius-input)",
              fontSize: "0.85rem",
              marginBottom: "16px",
              textAlign: "center",
            }}>
              {successMessage}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="school" className="form-label">
                {TEXT.login.schoolLabel}
              </label>
              <select
                id="school"
                className="form-input"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={loading}
              >
                <option value="">{TEXT.login.schoolDefault}</option>
                {schools.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                {TEXT.login.nameLabel}
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder={TEXT.login.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {TEXT.login.passwordLabel}
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder={TEXT.login.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              id="btn-login"
              disabled={loading}
            >
              {loading ? TEXT.login.submitting : TEXT.login.submitButton}
            </button>
          </form>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/register"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.9) 100%)",
                border: "2px solid #005e99",
                borderRadius: "14px",
                padding: "11px 14px",
                textDecoration: "none",
                color: "#005e99",
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 10px rgba(0,94,153,0.13)",
                fontFamily: "var(--font-main)",
              }}
            >
              <span>{TEXT.login.registerLink}</span>
              <span style={{ display: "flex", gap: "5px", alignItems: "center", flexShrink: 0 }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f8b500", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff1a94", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#005e99", display: "inline-block" }} />
              </span>
            </Link>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "var(--font-main)",
                textAlign: "center",
              }}
              disabled={resetRequesting}
              onClick={async () => {
                if (!school || !name.trim()) {
                  setError(TEXT.passwordReset.inputRequired);
                  return;
                }
                setResetRequesting(true);
                setError("");
                setSuccessMessage("");
                try {
                  const res = await fetch("/api/password-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ school, name: name.trim() }),
                  });
                  if (res.ok) {
                    setSuccessMessage(TEXT.passwordReset.requestSent);
                  } else {
                    setError(TEXT.passwordReset.requestFailed);
                  }
                } catch {
                  setError(TEXT.passwordReset.requestFailed);
                } finally {
                  setResetRequesting(false);
                }
              }}
            >
              {TEXT.passwordReset.linkText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
