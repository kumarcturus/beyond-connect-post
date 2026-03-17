import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis, { verifyAdmin } from "@/app/lib/redis";

export async function GET() {
  try {
    const cookieStore = await cookies();
    if (!verifyAdmin(cookieStore.get("admin_gate")?.value)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    // 全宛先を取得
    const recipientIds = await redis.smembers("bcp:recipient_list");
    const recipients = [];

    for (const rcptId of recipientIds) {
      const data = await redis.get(`bcp:recipient:${rcptId}`);
      if (!data) continue;
      const recipient = JSON.parse(data);

      // リンクされたOGアカウント情報を取得
      let idol = null;
      if (recipient.idol_id) {
        const idolData = await redis.get(`bcp:idol:${recipient.idol_id}`);
        if (idolData) {
          const parsed = JSON.parse(idolData);
          idol = {
            id: parsed.id,
            name: parsed.name,
            admin_name: parsed.admin_name || null,
            display_name: parsed.display_name || parsed.name,
            status: parsed.status,
            created_at: parsed.created_at,
          };
        }
      }

      recipients.push({ ...recipient, idol });
    }

    // メッセージ数をカウント
    const allMessages = await redis.lrange("beyond_connect_messages", 0, -1);
    const messageCounts: Record<string, number> = {};
    for (const msg of allMessages) {
      try {
        const parsed = JSON.parse(msg);
        const rid = parsed.receiver_id;
        if (rid) {
          messageCounts[rid] = (messageCounts[rid] || 0) + 1;
        }
      } catch {}
    }

    // 招待コード情報を取得
    const inviteCodes = await redis.smembers("bcp:invite_list");
    const invites: Record<string, unknown>[] = [];
    for (const code of inviteCodes) {
      const data = await redis.get(`bcp:invite:${code}`);
      if (data) {
        invites.push(JSON.parse(data));
      }
    }

    // 登録リクエストを取得
    const requestIds = await redis.smembers("bcp:request_list");
    const requests = [];
    for (const reqId of requestIds) {
      const data = await redis.get(`bcp:request:${reqId}`);
      if (data) {
        requests.push(JSON.parse(data));
      }
    }
    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 宛先にメッセージ数と招待コード情報を付与
    const result = recipients.map((r) => ({
      ...r,
      message_count: messageCounts[r.id] || 0,
      invite: invites.find((inv) => inv.recipient_id === r.id) || null,
    }));

    // パスワードリセットリクエストを取得
    const resetRequestsRaw = await redis.lrange("bcp:password_reset_requests", 0, -1);
    const resetRequests = resetRequestsRaw.map((raw) => {
      try { return JSON.parse(raw); } catch { return null; }
    }).filter(Boolean);

    return NextResponse.json({ recipients: result, invites, requests, resetRequests });
  } catch (error: unknown) {
    console.error("Admin idols GET error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
