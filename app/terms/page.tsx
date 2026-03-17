import Link from "next/link";
import { TEXT } from "@/app/lib/text";

export default function TermsPage() {
  return (
    <div className="page-container">
      <div className="wave-bg" />

      <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
        <Link href="/" className="back-link">
          {TEXT.common.backToTop}
        </Link>

        <div className="card">
          <h1 className="page-title">{TEXT.terms.title}</h1>

          {/* セクション1: このサービスについて */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.aboutTitle}</h2>
            <p className="terms-body pre-line">{TEXT.terms.aboutBody}</p>
          </section>

          {/* セクション2: ご利用にあたってのお願い */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.guidelinesTitle}</h2>
            <p className="terms-sub-heading">{TEXT.terms.guidelinesForSenders}</p>
            <ul className="terms-list">
              {TEXT.terms.guidelineSenderRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
            <p className="terms-sub-heading" style={{ marginTop: "12px" }}>
              {TEXT.terms.guidelinesForOgs}
            </p>
            <ul className="terms-list">
              {TEXT.terms.guidelineOgRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </section>

          {/* セクション3: プライバシーについて */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.privacyTitle}</h2>
            <ul className="terms-list">
              {TEXT.terms.privacyRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </section>

          {/* セクション4: 免責事項 */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.disclaimerTitle}</h2>
            <ul className="terms-list">
              {TEXT.terms.disclaimerRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </section>

          {/* セクション5: 権利について */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.rightsTitle}</h2>
            <ul className="terms-list">
              {TEXT.terms.rightsRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </section>

          {/* セクション6: 禁止事項 */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.prohibitedTitle}</h2>
            <p className="terms-body">{TEXT.terms.prohibitedIntro}</p>
            <ul className="terms-list">
              {TEXT.terms.prohibitedRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </section>

          {/* セクション7: お問い合わせ */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.contactTitle}</h2>
            <p className="terms-body">{TEXT.terms.contactBody}</p>
          </section>

          {/* フッター */}
          <p style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            marginTop: "24px",
          }}>
            {TEXT.terms.lastUpdated}
          </p>
        </div>
      </div>
    </div>
  );
}
