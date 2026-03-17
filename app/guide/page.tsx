import Link from "next/link";
import { TEXT } from "@/app/lib/text";

export default function GuidePage() {
  return (
    <div className="page-container">
      <div className="wave-bg" />

      <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
        <Link href="/" className="back-link">
          {TEXT.common.backToTop}
        </Link>

        <div className="card">
          <h1 className="page-title">{TEXT.guide.title}</h1>

          {/* コンセプト */}
          <section style={{ marginBottom: "24px" }}>
            <p className="terms-body">
              <strong>Beyond</strong> — {TEXT.guide.conceptBeyond.replace("Beyond — ", "")}
            </p>
            <p className="terms-body">
              <strong>Connect</strong> — {TEXT.guide.conceptConnect.replace("Connect — ", "")}
            </p>
            <p className="terms-body">
              <strong>{TEXT.guide.conceptPost}</strong>
            </p>
            <p className="terms-body" style={{ marginTop: "12px" }}>
              {TEXT.guide.conceptDescription}
            </p>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "24px 0" }} />

          {/* サービスについて */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.guide.serviceTitle}</h2>
            <p className="terms-body">{TEXT.guide.serviceDescription}</p>
            <ul className="terms-list">
              {TEXT.guide.serviceFeatures.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/(\S+?)(?=\s(?:で、|する|には))/g, (match) => `<strong>${match}</strong>`) }} />
              ))}
            </ul>
            <p className="terms-body" style={{ marginTop: "12px" }}>
              <strong>URL：</strong> {TEXT.guide.serviceUrl}
            </p>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "24px 0" }} />

          {/* みなさまへ — メッセージの送り方 */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.guide.sendTitle}</h2>

            <p className="terms-sub-heading">{TEXT.guide.sendFlowTitle}</p>
            <ol className="terms-list" style={{ listStyleType: "decimal" }}>
              {TEXT.guide.sendFlowSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.sendFeaturesTitle}</p>
            <ul className="terms-list">
              {TEXT.guide.sendFeatures.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.sendNotesTitle}</p>
            <ul className="terms-list">
              {TEXT.guide.sendNotes.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "24px 0" }} />

          {/* スクールアイドルOGの方へ */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.guide.ogTitle}</h2>

            <p className="terms-sub-heading">{TEXT.guide.ogRegisterIntro}</p>
            <p className="terms-body">{TEXT.guide.ogRegisterDescription}</p>
            <p className="terms-body">{TEXT.guide.ogRegisterNote}</p>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.ogWithCodeTitle}</p>
            <ol className="terms-list" style={{ listStyleType: "decimal" }}>
              {TEXT.guide.ogWithCodeSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.ogWithoutCodeTitle}</p>
            <ol className="terms-list" style={{ listStyleType: "decimal" }}>
              {TEXT.guide.ogWithoutCodeSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.ogLoginTitle}</p>
            <ol className="terms-list" style={{ listStyleType: "decimal" }}>
              {TEXT.guide.ogLoginSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.ogFaqTitle}</p>
            <ul className="terms-list" style={{ listStyle: "none", paddingLeft: 0 }}>
              {TEXT.guide.ogFaqItems.map((faq, i) => (
                <li key={i} style={{ marginBottom: "12px" }}>
                  <strong>{faq.q}</strong>
                  <br />
                  {faq.a}
                </li>
              ))}
            </ul>
          </section>

          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "24px 0" }} />

          {/* セキュリティについて */}
          <section style={{ marginBottom: "24px" }}>
            <h2 className="terms-section-title">{TEXT.guide.securityTitle}</h2>
            <p className="terms-body">{TEXT.guide.securityDescription}</p>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.securityMessageTitle}</p>
            <ul className="terms-list">
              {TEXT.guide.securityMessageItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.securityAccountTitle}</p>
            <ul className="terms-list">
              {TEXT.guide.securityAccountItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.securityServiceTitle}</p>
            <ul className="terms-list">
              {TEXT.guide.securityServiceItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="terms-sub-heading" style={{ marginTop: "16px" }}>{TEXT.guide.securityOtherTitle}</p>
            <p className="terms-body">{TEXT.guide.securityOtherNote}</p>
            <p className="terms-body">{TEXT.guide.securitySourceNote}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
