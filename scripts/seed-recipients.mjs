import Redis from "ioredis";

const RECIPIENTS = [
  { name: "セラス柳田リリエンフェルト", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "桂城泉", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "百生吟子", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "徒町小鈴", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "安養寺姫芽", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "日野下花帆", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "村野さやか", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "大沢瑠璃乃", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "乙宗梢", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "夕霧綴理", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "藤島慈", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "大賀美沙知", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "錦上マイカ", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "令沢葵", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "紫輪みおん", school: "蓮ノ空女学院", school_short: "蓮" },
  { name: "襟川つぐみ", school: "新潟県立晴里高校", school_short: "晴" },
];

function generateId(prefix) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix + "_";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    console.error("REDIS_URL が設定されていません。.env.local を確認してください。");
    process.exit(1);
  }

  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

  try {
    await redis.ping();
    console.log("Redis 接続 OK");
  } catch (err) {
    console.error("Redis 接続失敗:", err.message);
    process.exit(1);
  }

  let added = 0;
  let skipped = 0;

  const existingIds = await redis.smembers("bcp:recipient_list");
  const existingPairs = new Set();
  for (const id of existingIds) {
    const data = await redis.get(`bcp:recipient:${id}`);
    if (!data) continue;
    try {
      const r = JSON.parse(data);
      existingPairs.add(`${r.school}|${r.name}`);
    } catch {}
  }

  for (const r of RECIPIENTS) {
    const key = `${r.school}|${r.name}`;
    if (existingPairs.has(key)) {
      console.log(`SKIP : ${r.school} / ${r.name}（既に登録済み）`);
      skipped++;
      continue;
    }

    const id = generateId("rcpt");
    const record = {
      id,
      name: r.name,
      school: r.school,
      school_short: r.school_short,
      idol_id: null,
      created_at: new Date().toISOString(),
    };

    await redis.set(`bcp:recipient:${id}`, JSON.stringify(record));
    await redis.sadd("bcp:recipient_list", id);
    console.log(`ADD  : ${r.school} / ${r.name} (${id})`);
    added++;
  }

  console.log(`\n完了: 追加 ${added} 件 / スキップ ${skipped} 件 / 合計 ${RECIPIENTS.length} 件`);

  await redis.quit();
}

main().catch((err) => {
  console.error("エラー:", err);
  process.exit(1);
});
