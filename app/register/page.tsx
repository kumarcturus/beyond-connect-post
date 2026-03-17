"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEXT } from "@/app/lib/text";

interface School {
  name: string;
  short: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [school, setSchool] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");

  // 学校一覧を取得
  useEffect(() => {
    fetch("/api/schools")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteCode.trim()) {
      setError(TEXT.register.inviteCodeRequired);
      return;
    }
    if (!school) {
      setError(TEXT.register.schoolRequired);
      return;
    }
    if (!name.trim()) {
      setError(TEXT.register.nameRequired);
      return;
    }
    if (password.length < 8) {
      setError(TEXT.register.passwordTooShort);
      return;
    }
    if (password !== passwordConfirm) {
      setError(TEXT.register.passwordMismatch);
      return;
    }

    setRegistering(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: inviteCode.trim(),
          school,
          name: name.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || TEXT.register.registerFailed);
        return;
      }

      // 成功 → ログインページへ
      router.push("/login?registered=1");
    } catch {
      setError(TEXT.common.serverError);
    } finally {
      setRegistering(false);
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
          <h1 className="page-title">{TEXT.register.title}</h1>
          <p className="page-subtitle">
            {TEXT.register.subtitle}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="inviteCode" className="form-label">{TEXT.register.inviteCodeLabel}</label>
              <input
                type="text"
                id="inviteCode"
                className="form-input"
                placeholder={TEXT.register.inviteCodePlaceholder}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={registering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="school" className="form-label">{TEXT.register.schoolLabel}</label>
              <select
                id="school"
                className="form-input"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={registering}
              >
                <option value="">{TEXT.register.schoolDefault}</option>
                {schools.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">{TEXT.register.nameLabel}</label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder={TEXT.register.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={registering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {TEXT.register.passwordLabel}
                <span className="form-label-sub">{TEXT.register.passwordSub}</span>
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder={TEXT.register.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={registering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm" className="form-label">{TEXT.register.passwordConfirmLabel}</label>
              <input
                type="password"
                id="passwordConfirm"
                className="form-input"
                placeholder={TEXT.register.passwordConfirmPlaceholder}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={registering}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={registering}
            >
              {registering ? TEXT.register.submitting : TEXT.register.submitButton}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link href="/request" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {TEXT.register.requestLink}
            </Link>
            <Link href="/login" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {TEXT.register.loginLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
