import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || process.env.KV_URL || "";
const redis = redisUrl ? new Redis(redisUrl) : null;

export default redis;

export function generateId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix + "_";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function verifyAdmin(cookieValue: string | undefined): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return true;
  return cookieValue === adminPassword;
}
