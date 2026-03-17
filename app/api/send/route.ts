import { NextRequest, NextResponse } from "next/server";
import redis, { generateId } from "@/app/lib/redis";
import { checkRateLimit, getClientIp } from "@/app/lib/ratelimit";
import { containsNgWord } from "@/app/lib/ngwords";

// メッセージの型定義
interface Message {
  id: string;
  sender_nickname: string;
  receiver_id: string;
  body: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // レート制限: IPアドレスベース（1時間に30通まで）
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit(`ratelimit:send:ip:${ip}`, 30, 3600);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "しばらく待ってから再度お試しください" },
        { status: 429 }
      );
    }

    const { receiver_id, sender_nickname, body } = await request.json();

    // バリデーション
    if (!receiver_id || !sender_nickname || !body) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    // ニックネームの長さ制限（サーバーサイド）
    if (sender_nickname.trim().length > 50) {
      return NextResponse.json(
        { error: "ニックネームは50文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (body.length > 1000) {
      return NextResponse.json(
        { error: "メッセージは1000文字以内で入力してください" },
        { status: 400 }
      );
    }

    // NGワードチェック
    if (containsNgWord(body) || containsNgWord(sender_nickname)) {
      return NextResponse.json(
        { error: "送信できない表現が含まれています。内容を確認してください。" },
        { status: 400 }
      );
    }

    if (!redis) {
      console.error("REDIS_URL is not defined in environment variables.");
      throw new Error("Redis client is not initialized. Please check REDIS_URL.");
    }

    // 宛先の存在チェック
    const recipientData = await redis.get(`bcp:recipient:${receiver_id}`);
    if (!recipientData) {
      return NextResponse.json(
        { error: "指定された宛先が存在しません" },
        { status: 400 }
      );
    }

    // メッセージ作成
    const message: Message = {
      id: generateId("msg"),
      sender_nickname: sender_nickname.trim(),
      receiver_id,
      body: body.trim(),
      timestamp: new Date().toISOString(),
    };

    // リストの先頭に追加
    await redis.lpush("beyond_connect_messages", JSON.stringify(message));

    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Send error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
