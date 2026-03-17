import { NextRequest, NextResponse } from "next/server";
import redis, { generateId } from "@/app/lib/redis";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { invite_code, school, name, password } = await request.json();

    if (!invite_code || !school || !name || !password) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
    }

    // 入力のtrim
    const trimmedName = name.trim();
    const trimmedSchool = school.trim();

    if (password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上で入力してください" }, { status: 400 });
    }

    // 入力長さ制限
    if (trimmedName.length > 50) {
      return NextResponse.json({ error: "氏名は50文字以内で入力してください" }, { status: 400 });
    }

    // 招待コードの形式チェック（英数字のみ、12文字）
    if (!/^[a-z0-9]+$/.test(invite_code)) {
      return NextResponse.json({ error: "無効な招待コードです" }, { status: 400 });
    }

    // 招待コードを確認
    const inviteData = await redis.get(`bcp:invite:${invite_code}`);
    if (!inviteData) {
      return NextResponse.json({ error: "無効な招待コードです" }, { status: 400 });
    }

    const invite = JSON.parse(inviteData);
    if (invite.status === "used") {
      return NextResponse.json({ error: "この招待コードは既に使用されています" }, { status: 400 });
    }

    // 同一学校+同名チェック（trimして比較）
    const existingIdol = await redis.get(`bcp:idol_login:${trimmedSchool}:${trimmedName}`);
    if (existingIdol) {
      return NextResponse.json({ error: "この学校名・氏名の組み合わせは既に登録されています" }, { status: 400 });
    }

    // 宛先データから school_short を取得＋学校名・氏名の一致チェック
    let schoolShort = trimmedSchool;
    if (invite.recipient_id) {
      const recipientData = await redis.get(`bcp:recipient:${invite.recipient_id}`);
      if (recipientData) {
        const recipient = JSON.parse(recipientData);
        // 招待コードにリンクされた宛先と学校名・氏名が一致するか確認（trim比較）
        if (recipient.school.trim() !== trimmedSchool || recipient.name.trim() !== trimmedName) {
          return NextResponse.json(
            { error: "学校名または氏名が招待コードの情報と一致しません" },
            { status: 400 }
          );
        }
        if (recipient.school_short) {
          schoolShort = recipient.school_short;
        }
      }
    }

    // 管理名と表示名を生成
    const adminName = `${schoolShort} ${trimmedName}`;
    const displayName = trimmedName;

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // OGアカウント作成
    const idolId = generateId("idol");
    const idol = {
      id: idolId,
      name: trimmedName,
      school: trimmedSchool,
      school_short: schoolShort,
      admin_name: adminName,
      display_name: displayName,
      password_hash: passwordHash,
      status: "registered",
      created_at: new Date().toISOString(),
    };

    await redis.set(`bcp:idol:${idolId}`, JSON.stringify(idol));
    // ログインキー: 学校名+氏名 → idol_id
    await redis.set(`bcp:idol_login:${trimmedSchool}:${trimmedName}`, idolId);

    // 招待コードを使用済みに更新
    invite.status = "used";
    invite.idol_id = idolId;
    invite.used_at = new Date().toISOString();
    await redis.set(`bcp:invite:${invite_code}`, JSON.stringify(invite));

    // 宛先マスタにidol_idをリンク（または自動作成）
    if (invite.recipient_id) {
      const recipientData = await redis.get(`bcp:recipient:${invite.recipient_id}`);
      if (recipientData) {
        const recipient = JSON.parse(recipientData);
        recipient.idol_id = idolId;
        await redis.set(`bcp:recipient:${invite.recipient_id}`, JSON.stringify(recipient));
      }
    } else {
      // 招待コードに宛先が紐づいていない場合、自動で宛先を作成
      const rcptId = generateId("rcpt");
      const recipient = {
        id: rcptId,
        name: trimmedName,
        school: trimmedSchool,
        school_short: schoolShort,
        idol_id: idolId,
        created_at: new Date().toISOString(),
      };
      await redis.set(`bcp:recipient:${rcptId}`, JSON.stringify(recipient));
      await redis.sadd("bcp:recipient_list", rcptId);
    }

    return NextResponse.json({ success: true, name: trimmedName }, { status: 201 });
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
