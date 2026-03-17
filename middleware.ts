import { NextRequest, NextResponse } from "next/server";

/**
 * Gate認証の対象外パスリスト
 * ここに追加されたパスはGate認証なしで閲覧可能
 */
const PUBLIC_PATHS = ["/terms"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 公開パスの場合、カスタムヘッダーを設定
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    response.headers.set("x-public-page", "1");
  }

  return response;
}

export const config = {
  // 静的アセットとAPIを除外
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
