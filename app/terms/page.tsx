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

          {/* 1. サービス説明 */}
          <section style={{ marginBottom: "28px" }}>
            <h2 className="terms-section-title">{TEXT.terms.serviceTitle}</h2>
            {[
              { text: TEXT.terms.conceptBeyond, mb: "6px" },
              { text: TEXT.terms.conceptConnect, mb: "6px" },
              { text: TEXT.terms.conceptPost,    mb: "14px" },
            ].map(({ text, mb }, i) => {
              const sep = text.indexOf(" — ");
              const label   = sep >= 0 ? text.slice(0, sep) + " —" : text;
              const content = sep >= 0 ? text.slice(sep + 3) : "";
              return (
                <p key={i} className="terms-concept-item" style={{ marginBottom: mb }}>
                  <span className="terms-concept-label">{label}</span>
                  {content && <span>{content}</span>}
                </p>
              );
            })}
            <p className="terms-body" style={{ marginBottom: "12px" }}>{TEXT.terms.serviceDescription}</p>
            <ul className="terms-list">
              {TEXT.terms.serviceFeatures.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </section>

          {/* 2. ファン向け使い方 */}
          <section style={{ marginBottom: "28px" }}>
            <h2 className="terms-section-title">{TEXT.terms.sendGuideTitle}</h2>
            <p className="terms-sub-heading">{TEXT.terms.sendFlowTitle}</p>
            <ol className="terms-list">
              {TEXT.terms.sendFlowSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.sendFeaturesTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.sendFeatures.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </section>

          {/* 3. OG向け使い方 */}
          <section style={{ marginBottom: "28px" }}>
            <h2 className="terms-section-title">{TEXT.terms.ogGuideTitle}</h2>
            <p className="terms-body" style={{ marginBottom: "12px" }}>{TEXT.terms.ogRegisterDescription}</p>

            <p className="terms-sub-heading">{TEXT.terms.ogWithCodeTitle}</p>
            <ol className="terms-list">
              {TEXT.terms.ogWithCodeSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.ogWithoutCodeTitle}</p>
            <ol className="terms-list">
              {TEXT.terms.ogWithoutCodeSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.ogLoginTitle}</p>
            <ol className="terms-list">
              {TEXT.terms.ogLoginSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "18px" }}>{TEXT.terms.ogFaqTitle}</p>
            {TEXT.terms.ogFaqItems.map((item, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <p className="terms-body" style={{ fontWeight: 600, marginBottom: "2px" }}>Q: {item.q}</p>
                <p className="terms-body">A: {item.a}</p>
              </div>
            ))}
          </section>

          {/* 4. セキュリティ */}
          <section style={{ marginBottom: "28px" }}>
            <h2 className="terms-section-title">{TEXT.terms.securityTitle}</h2>
            <p className="terms-body" style={{ marginBottom: "14px" }}>{TEXT.terms.securityDescription}</p>

            <p className="terms-sub-heading">{TEXT.terms.securityMessageTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.securityMessageItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.securityAccountTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.securityAccountItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.securityPrivacyTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.securityPrivacyItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.securityServiceTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.securityServiceItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          {/* 5. 注意事項・禁止事項・免責事項・権利表記 */}
          <section style={{ marginBottom: "28px" }}>
            <h2 className="terms-section-title">{TEXT.terms.rulesTitle}</h2>

            <p className="terms-sub-heading">{TEXT.terms.notesOgTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.notesOgItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.prohibitedTitle}</p>
            <p className="terms-body" style={{ marginBottom: "6px" }}>{TEXT.terms.prohibitedIntro}</p>
            <ul className="terms-list">
              {TEXT.terms.prohibitedRules.map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.disclaimerTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.disclaimerRules.map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "14px" }}>{TEXT.terms.rightsTitle}</p>
            <ul className="terms-list">
              {TEXT.terms.rightsRules.map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>
          </section>

          {/* お問い合わせ */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.terms.contactTitle}</h2>
            <p className="terms-body">{TEXT.terms.contactBody}</p>
          </section>

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
