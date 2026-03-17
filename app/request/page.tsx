"use client";

import { useState } from "react";
import Link from "next/link";
import { TEXT } from "@/app/lib/text";

export default function RequestPage() {
  const [school, setSchool] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!school.trim()) {
      setError(TEXT.request.schoolRequired);
      return;
    }
    if (!name.trim()) {
      setError(TEXT.request.nameRequired);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: school.trim(),
          name: name.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || TEXT.request.submitFailed);
        return;
      }

      setSuccess(true);
    } catch {
      setError(TEXT.common.serverError);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="wave-bg" />
        <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
          <div className="card">
            <div className="success-container">
              <div className="success-icon">{TEXT.request.successIcon}</div>
              <h2 className="success-title">{TEXT.request.successTitle}</h2>
              <p className="success-message pre-line">{TEXT.request.successMessage}</p>
              <Link href="/register" className="btn btn-secondary">
                {TEXT.request.backToLogin}
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
        <Link href="/register" className="back-link">
          {TEXT.request.backToLogin}
        </Link>

        <div className="card">
          <h1 className="page-title pre-line">{TEXT.request.title}</h1>
          <p className="page-subtitle">{TEXT.request.subtitle}</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="school" className="form-label">{TEXT.request.schoolLabel}</label>
              <input
                type="text"
                id="school"
                className="form-input"
                placeholder={TEXT.request.schoolPlaceholder}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">{TEXT.request.nameLabel}</label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder={TEXT.request.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? TEXT.request.submitting : TEXT.request.submitButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
