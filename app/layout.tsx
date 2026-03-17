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
  const cookieStore = await cookies();
  const passedRef = cookieStore.get("admin_gate")?.value;

  // middlewareで公開ページフラグが設定されている場合はGateをスキップ
  const headerStore = await headers();
  const isPublicPage = headerStore.get("x-public-page") === "1";

  const isAuthorized = isPublicPage || !adminPassword || passedRef === adminPassword;

  return (
    <html lang="ja">
      <body>
        {!isAuthorized ? <Gate /> : children}
      </body>
    </html>
  );
}
