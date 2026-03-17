import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis from "@/app/lib/redis";

export async function GET(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    // セッション認証: Cookieから直接idol_idを取得
    const cookieStore = await cookies();
    const idolId = cookieStore.get("idol_session")?.value;
    if (!idolId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // OGにリンクされた宛先IDを取得
    const idolData = await redis.get(`bcp:idol:${idolId}`);
    if (!idolData) {
      return NextResponse.json({ error: "アカウントが見つかりません" }, { status: 404 });
    }

    // 全宛先からこのidol_idにリンクされたものを探す
    const recipientIds = await redis.smembers("bcp:recipient_list");
    const linkedRecipientIds: string[] = [];
    for (const rcptId of recipientIds) {
      const rcptData = await redis.get(`bcp:recipient:${rcptId}`);
      if (rcptData) {
        const rcpt = JSON.parse(rcptData);
        if (rcpt.idol_id === idolId) {
          linkedRecipientIds.push(rcpt.id);
        }
      }
    }

    // メッセージをフィルタ
    const allMessages = await redis.lrange("beyond_connect_messages", 0, -1);
    const messages = allMessages
      .map((msg) => {
        try { return JSON.parse(msg); } catch { return null; }
      })
      .filter((msg) => msg && linkedRecipientIds.includes(msg.receiver_id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
