import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis, { generateId, verifyAdmin } from "@/app/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!verifyAdmin(cookieStore.get("admin_gate")?.value)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { name, school, school_short } = await request.json();

    if (!name || !school) {
      return NextResponse.json({ error: "氏名と学校名は必須です" }, { status: 400 });
    }

    if (!school_short) {
      return NextResponse.json({ error: "学校名略称は必須です" }, { status: 400 });
    }

    // 入力長さ制限
    if (name.trim().length > 50) {
      return NextResponse.json({ error: "氏名は50文字以内で入力してください" }, { status: 400 });
    }
    if (school.trim().length > 100) {
      return NextResponse.json({ error: "学校名は100文字以内で入力してください" }, { status: 400 });
    }

    // 重複チェック: 同じ学校名+氏名の宛先マスターが既に存在するか
    const recipientIds = await redis.smembers("bcp:recipient_list");
    for (const rcptId of recipientIds) {
      const data = await redis.get(`bcp:recipient:${rcptId}`);
      if (!data) continue;
      const existing = JSON.parse(data);
      if (existing.school.trim() === school.trim() && existing.name.trim() === name.trim()) {
        return NextResponse.json(
          { error: "同じ学校名・氏名の宛先がすでに登録されています" },
          { status: 400 }
        );
      }
    }

    const id = generateId("rcpt");
    const recipient = {
      id,
      name: name.trim(),
      school: school.trim(),
      school_short: school_short.trim(),
      idol_id: null,
      created_at: new Date().toISOString(),
    };

    await redis.set(`bcp:recipient:${id}`, JSON.stringify(recipient));
    await redis.sadd("bcp:recipient_list", id);

    return NextResponse.json({ id, name, school, school_short }, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin recipients POST error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!verifyAdmin(cookieStore.get("admin_gate")?.value)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    }

    // 宛先データを取得して関連データも削除
    const recipientData = await redis.get(`bcp:recipient:${id}`);
    if (recipientData) {
      const recipient = JSON.parse(recipientData);

      // リンクされたOGアカウントを削除
      if (recipient.idol_id) {
        const idolData = await redis.get(`bcp:idol:${recipient.idol_id}`);
        if (idolData) {
          const idol = JSON.parse(idolData);
          // ログインキーを削除
          if (idol.school && idol.name) {
            await redis.del(`bcp:idol_login:${idol.school}:${idol.name}`);
          }
        }
        await redis.del(`bcp:idol:${recipient.idol_id}`);
      }

      // リンクされた招待コードを削除
      const inviteCodes = await redis.smembers("bcp:invite_list");
      for (const code of inviteCodes) {
        const inviteData = await redis.get(`bcp:invite:${code}`);
        if (inviteData) {
          const invite = JSON.parse(inviteData);
          if (invite.recipient_id === id) {
            await redis.del(`bcp:invite:${code}`);
            await redis.srem("bcp:invite_list", code);
          }
        }
      }
    }

    // 宛先自体を削除
    await redis.srem("bcp:recipient_list", id);
    await redis.del(`bcp:recipient:${id}`);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin recipients DELETE error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
