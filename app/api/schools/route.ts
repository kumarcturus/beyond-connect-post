import { NextResponse } from "next/server";
import redis from "@/app/lib/redis";

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    // 全宛先からユニークな学校名を取得
    const recipientIds = await redis.smembers("bcp:recipient_list");
    const schoolMap = new Map<string, string>(); // school → school_short

    for (const rcptId of recipientIds) {
      const data = await redis.get(`bcp:recipient:${rcptId}`);
      if (!data) continue;
      const recipient = JSON.parse(data);
      if (recipient.school) {
        schoolMap.set(recipient.school, recipient.school_short || recipient.school);
      }
    }

    const schools = Array.from(schoolMap.entries()).map(([name, short]) => ({
      name,
      short,
    }));

    return NextResponse.json(schools);
  } catch (error: unknown) {
    console.error("Schools GET error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
