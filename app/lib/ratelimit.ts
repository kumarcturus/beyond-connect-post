import redis from "@/app/lib/redis";

/**
 * レート制限ユーティリティ
 * Redis の INCR + EXPIRE でシンプルなカウンター方式を実装
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * レート制限をチェックする
 * @param key   - Redisキー（例: "ratelimit:send:ip:1.2.3.4"）
 * @param limit - 許可する最大リクエスト数
 * @param windowSeconds - ウィンドウの秒数
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (!redis) {
    // Redis未接続時はレート制限をスキップ
    return { allowed: true, remaining: limit, resetInSeconds: 0 };
  }

  const current = await redis.incr(key);

  if (current === 1) {
    // 初回アクセス時にTTLを設定
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);

  if (current > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  }

  return {
    allowed: true,
    remaining: limit - current,
    resetInSeconds: ttl > 0 ? ttl : windowSeconds,
  };
}

/**
 * リクエストからIPアドレスを取得する（Vercel環境対応）
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
