import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis, { verifyAdmin } from "@/app/lib/redis";

function generateInviteCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!verifyAdmin(cookieStore.get("admin_gate")?.value)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { suggested_name, recipient_id, force } = await request.json();

    // 同じ宛先に対して未使用の招待コードがあるか警告チェック
    if (recipient_id && !force) {
      const inviteCodes = await redis.smembers("bcp:invite_list");
      for (const existingCode of inviteCodes) {
        const data = await redis.get(`bcp:invite:${existingCode}`);
        if (data) {
          const existing = JSON.parse(data);
          if (existing.recipient_id === recipient_id && existing.status !== "used") {
            return NextResponse.json(
              {
                warning: "この宛先には未使用の招待コードがすでに存在します。新しく発行しますか？",
                existing_code: existingCode,
              },
              { status: 409 }
            );
          }
        }
      }
    }

    const code = generateInviteCode();
    const invite = {
      code,
      suggested_name: suggested_name || null,
      recipient_id: recipient_id || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    await redis.set(`bcp:invite:${code}`, JSON.stringify(invite));
    await redis.sadd("bcp:invite_list", code);

    return NextResponse.json({ code }, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin invite POST error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
