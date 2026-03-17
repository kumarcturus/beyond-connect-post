import { NextRequest, NextResponse } from "next/server";
import redis from "@/app/lib/redis";
import { checkRateLimit, getClientIp } from "@/app/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    // レート制限
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`ratelimit:pw-reset:ip:${ip}`, 3, 3600);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "しばらく待ってから再度お試しください" },
        { status: 429 }
      );
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { school, name } = await request.json();

    if (!school || !name) {
      return NextResponse.json(
        { error: "学校名と氏名を入力してください" },
        { status: 400 }
      );
    }

    const resetRequest = {
      school: school.trim(),
      name: name.trim(),
      requested_at: new Date().toISOString(),
    };

    // リストの先頭に追加
    await redis.lpush("bcp:password_reset_requests", JSON.stringify(resetRequest));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
