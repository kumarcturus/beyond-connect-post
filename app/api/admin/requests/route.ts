import { NextRequest, NextResponse } from "next/server";
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

    const requestIds = await redis.smembers("bcp:request_list");
    const requests = [];

    for (const reqId of requestIds) {
      const data = await redis.get(`bcp:request:${reqId}`);
      if (data) {
        requests.push(JSON.parse(data));
      }
    }

    // 新しい順にソート
    requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(requests);
  } catch (error: unknown) {
    console.error("Admin requests GET error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    if (!verifyAdmin(cookieStore.get("admin_gate")?.value)) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: "Redisに接続できません" }, { status: 500 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "IDとステータスが必要です" }, { status: 400 });
    }

    const data = await redis.get(`bcp:request:${id}`);
    if (!data) {
      return NextResponse.json({ error: "リクエストが見つかりません" }, { status: 404 });
    }

    const req = JSON.parse(data);
    req.status = status;
    req.handled_at = new Date().toISOString();
    await redis.set(`bcp:request:${id}`, JSON.stringify(req));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Admin requests PATCH error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
