import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// REDIS_URLを用いて接続インスタンスを作成。未設定時のエラーを防ぐ
const redisUrl = process.env.REDIS_URL || process.env.KV_URL || "";
const redis = redisUrl ? new Redis(redisUrl) : null;

// メッセージの型定義
interface Message {
  id: string;
  sender_nickname: string;
  receiver_id: string;
  body: string;
  timestamp: string;
}

// メッセージIDを生成
function generateMessageId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "msg_";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { receiver_id, sender_nickname, body } = await request.json();

    // バリデーション
    if (!receiver_id || !sender_nickname || !body) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    if (!redis) {
      console.error("REDIS_URL is not defined in environment variables.");
      throw new Error("Redis client is not initialized. Please check REDIS_URL.");
    }

    // メッセージ作成
    const message: Message = {
      id: generateMessageId(),
      sender_nickname,
      receiver_id,
      body,
      timestamp: new Date().toISOString(),
    };

    // リストの先頭に追加
    await redis.lpush("beyond_connect_messages", JSON.stringify(message));

    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Redis Error:", error);
    return NextResponse.json(
      { 
        error: "サーバーエラーが発生しました", 
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
