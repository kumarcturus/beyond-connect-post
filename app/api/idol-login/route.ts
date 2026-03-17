import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis from "@/app/lib/redis";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/app/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    // レート制限: IPアドレスベース（15分間に5回まで）
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`ratelimit:idol-login:ip:${ip}`, 5, 900);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "しばらく時間をおいてお試しください" },
        { status: 429 }
      );
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { school, name, password } = await request.json();

    if (!school || !name || !password) {
      return NextResponse.json({ error: "学校名・氏名・パスワードをすべて入力してください" }, { status: 400 });
    }

    // 学校名+氏名からidol_idを検索
    const idolId = await redis.get(`bcp:idol_login:${school}:${name.trim()}`);
    if (!idolId) {
      return NextResponse.json({ error: "名前またはパスワードが正しくありません" }, { status: 401 });
    }

    // OGデータを取得
    const idolData = await redis.get(`bcp:idol:${idolId}`);
    if (!idolData) {
      return NextResponse.json({ error: "名前またはパスワードが正しくありません" }, { status: 401 });
    }

    const idol = JSON.parse(idolData);

    // パスワード照合
    const isValid = await bcrypt.compare(password, idol.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "名前またはパスワードが正しくありません" }, { status: 401 });
    }

    // セッションCookieを設定
    const cookieStore = await cookies();
    cookieStore.set("idol_session", idolId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    return NextResponse.json({
      success: true,
      name: idol.display_name || idol.name,
    });
  } catch (error: unknown) {
    console.error("Idol login error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
