import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

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

    // メッセージ作成
    const message: Message = {
      id: generateMessageId(),
      sender_nickname,
      receiver_id,
      body,
      timestamp: new Date().toISOString(),
    };

    // Vercel KV に保存 (リストの先頭に追加)
    await kv.lpush("beyond_connect_messages", JSON.stringify(message));

    return NextResponse.json(
      { success: true, message },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("KV Error:", error);
    return NextResponse.json(
      { 
        error: "サーバーエラーが発生しました", 
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
