/**
 * scripts/wait-for-db.js
 *
 * Polls the DATABASE_URL host:port over TCP until Postgres accepts connections,
 * then exits 0.  Uses only Node built-ins — no extra dependencies required.
 *
 * Run before `prisma db push` in Railway's preDeployCommand so migrations
 * don't fire before the DB container is ready.
 */

const net = require("net");
const url = require("url");

const MAX_ATTEMPTS = 30;   // 30 × 2 s = up to 60 s of waiting
const INTERVAL_MS  = 2000;

function parseDbUrl(raw) {
  try {
    const parsed = new url.URL(raw);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || "5432", 10),
    };
  } catch {
    return null;
  }
}

function tryTcpConnect(host, port) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    socket.once("connect", () => { socket.destroy(); resolve(); });
    socket.once("error",   (err) => { socket.destroy(); reject(err); });
    // Hard timeout so we never hang longer than INTERVAL_MS
    socket.setTimeout(INTERVAL_MS, () => {
      socket.destroy();
      reject(new Error("TCP timeout"));
    });
  });
}

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("[wait-for-db] DATABASE_URL is not set — aborting.");
    process.exit(1);
  }

  const target = parseDbUrl(rawUrl);
  if (!target) {
    console.error("[wait-for-db] Could not parse DATABASE_URL — aborting.");
    process.exit(1);
  }

  console.log(`[wait-for-db] Waiting for Postgres at ${target.host}:${target.port}...`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await tryTcpConnect(target.host, target.port);
      console.log(`[wait-for-db] Postgres is ready (attempt ${attempt}).`);
      return;
    } catch (err) {
      console.log(`[wait-for-db] Attempt ${attempt}/${MAX_ATTEMPTS} — ${err.message}`);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, INTERVAL_MS));
      }
    }
  }

  console.error("[wait-for-db] Postgres did not become ready in time — aborting.");
  process.exit(1);
}

main();
