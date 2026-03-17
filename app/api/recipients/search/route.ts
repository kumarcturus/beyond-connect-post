import { NextRequest, NextResponse } from "next/server";
import redis from "@/app/lib/redis";
import { checkRateLimit, getClientIp } from "@/app/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    // レート制限: IPアドレスベース（1分に30回まで）
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`ratelimit:search:ip:${ip}`, 30, 60);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "しばらく待ってから再度お試しください" },
        { status: 429 }
      );
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").toLowerCase();

    const recipientIds = await redis.smembers("bcp:recipient_list");
    const results = [];

    for (const id of recipientIds) {
      const data = await redis.get(`bcp:recipient:${id}`);
      if (!data) continue;
      const recipient = JSON.parse(data);

      if (!query || recipient.name.toLowerCase().includes(query) || recipient.school.toLowerCase().includes(query)) {
        results.push({ id: recipient.id, name: recipient.name, school: recipient.school });
      }
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("Recipients search error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
