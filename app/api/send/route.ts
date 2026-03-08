import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Redisクライアントを REDIS_URL もしくはその他の環境変数から初期化
const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.REDIS_TOKEN || process.env.KV_REST_API_TOKEN;

// Tokenがない場合は URL 単体で接続を試みる（Vercel独自のRedisアドオン等に対応）
let redis: Redis | null = null;
if (redisUrl) {
  if (redisUrl.startsWith('http') && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken });
  } else {
    // もし REDIS_URL が redis:// 形式の場合を考慮（Upstash RESTではないが念の為フォールバック）
    // Upstash Redis は通常 REST_URL を提供しますが、もし利用できない場合はエラー回避用
    console.warn("Using alternative Redis connection initialization");
    try {
      redis = Redis.fromEnv();
    } catch {
      // Vercel上の Redis URL に合わせて初期化を調整 (URLが提供されていれば最低限の動作を試みる)
      redis = new Redis({ url: redisUrl, token: redisToken || "dummy" });
    }
  }
} else {
  try {
     redis = Redis.fromEnv();
  } catch (e) {
     console.error("Failed to init Redis from env", e);
  }
}

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

    // Vercel KV / Upstash Redis に保存 (リストの先頭に追加)
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
