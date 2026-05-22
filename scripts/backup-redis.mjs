import Redis from "ioredis";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = resolve(__dirname, "..", "backups");

function sanitizeIdol(idol) {
  const { password_hash: _pw, ...rest } = idol;
  return rest;
}

async function main() {
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    console.error("REDIS_URL が設定されていません。");
    process.exit(1);
  }

  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  await redis.ping();
  console.log("Redis 接続 OK");

  const snapshot = {
    backed_up_at: new Date().toISOString(),
    note: "メッセージ本文・password_hash は意図的に除外。復旧用メタデータのみ。",
    recipients: [],
    invites: [],
    idols: [],
    idol_logins: {},
    requests: [],
    counts: {},
  };

  const recipientIds = await redis.smembers("bcp:recipient_list");
  for (const id of recipientIds) {
    const data = await redis.get(`bcp:recipient:${id}`);
    if (data) snapshot.recipients.push(JSON.parse(data));
  }

  const inviteCodes = await redis.smembers("bcp:invite_list");
  for (const code of inviteCodes) {
    const data = await redis.get(`bcp:invite:${code}`);
    if (data) snapshot.invites.push(JSON.parse(data));
  }

  for (const recipient of snapshot.recipients) {
    if (!recipient.idol_id) continue;
    const data = await redis.get(`bcp:idol:${recipient.idol_id}`);
    if (data) snapshot.idols.push(sanitizeIdol(JSON.parse(data)));
  }

  for (const idol of snapshot.idols) {
    if (idol.school && idol.name) {
      const idolId = await redis.get(`bcp:idol_login:${idol.school}:${idol.name}`);
      if (idolId) snapshot.idol_logins[`${idol.school}|${idol.name}`] = idolId;
    }
  }

  const requestIds = await redis.smembers("bcp:request_list");
  for (const reqId of requestIds) {
    const data = await redis.get(`bcp:request:${reqId}`);
    if (data) snapshot.requests.push(JSON.parse(data));
  }

  const messageCount = await redis.llen("beyond_connect_messages");
  snapshot.counts = {
    recipients: snapshot.recipients.length,
    invites: snapshot.invites.length,
    idols: snapshot.idols.length,
    requests: snapshot.requests.length,
    messages_total: messageCount,
  };

  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true });
  }

  const latestPath = resolve(BACKUP_DIR, "latest.json");
  await writeFile(latestPath, JSON.stringify(snapshot, null, 2), "utf-8");

  console.log("バックアップ完了:");
  console.log(`  宛先: ${snapshot.counts.recipients} 件`);
  console.log(`  招待コード: ${snapshot.counts.invites} 件`);
  console.log(`  OG: ${snapshot.counts.idols} 件`);
  console.log(`  リクエスト: ${snapshot.counts.requests} 件`);
  console.log(`  メッセージ件数(参考): ${snapshot.counts.messages_total} 件 ※本文は含まず`);
  console.log(`  保存先: ${latestPath}`);

  await redis.quit();
}

main().catch((err) => {
  console.error("エラー:", err);
  process.exit(1);
});
