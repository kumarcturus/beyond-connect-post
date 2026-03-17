import { NextRequest, NextResponse } from "next/server";
import redis, { generateId } from "@/app/lib/redis";
import { checkRateLimit, getClientIp } from "@/app/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    // レート制限: IPアドレスベース（1時間に3件まで）
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`ratelimit:request:ip:${ip}`, 3, 3600);
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
      return NextResponse.json({ error: "学校名と氏名を入力してください" }, { status: 400 });
    }

    // 入力長さ制限（サーバーサイド）
    if (school.trim().length > 100) {
      return NextResponse.json({ error: "学校名は100文字以内で入力してください" }, { status: 400 });
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: "氏名は50文字以内で入力してください" }, { status: 400 });
    }

    const id = generateId("req");
    const req = {
      id,
      school: school.trim(),
      name: name.trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    await redis.set(`bcp:request:${id}`, JSON.stringify(req));
    await redis.sadd("bcp:request_list", id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Request POST error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
