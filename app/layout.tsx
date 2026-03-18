import type { Metadata } from "next";
import "./globals.css";
import { cookies, headers } from "next/headers";
import Gate from "./components/Gate";

export const metadata: Metadata = {
  title: "Beyond Connect POST",
  description: "スクールアイドルの卒業生にメッセージを届ける場所",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  // GATE_ENABLED=false でサイト全体のGateを無効化できる
  // 管理画面(/admin)は GATE_ENABLED に関わらず常にGateで保護される
  const gateEnabled = process.env.GATE_ENABLED !== "false";
  const cookieStore = await cookies();
  const passedRef = cookieStore.get("admin_gate")?.value;

  // middlewareで公開ページ・管理画面フラグが設定されている
  const headerStore = await headers();
  const isPublicPage = headerStore.get("x-public-page") === "1";
  const isAdminPage = headerStore.get("x-admin-page") === "1";

  // 認証判定:
  //   - 公開ページ: 常に通過
  //   - Gateが無効 かつ 管理画面でない: 通過
  //   - ADMIN_PASSWORD 未設定: 通過
  //   - admin_gate Cookie が ADMIN_PASSWORD と一致: 通過
  const isAuthorized =
    isPublicPage ||
    (!gateEnabled && !isAdminPage) ||
    !adminPassword ||
    passedRef === adminPassword;

  return (
    <html lang="ja">
      <body>
        {!isAuthorized ? <Gate /> : children}
      </body>
    </html>
  );
}
