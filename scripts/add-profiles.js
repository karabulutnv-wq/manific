const { createClient } = require("@libsql/client");
require("dotenv").config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      isActive INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Profile tablosu oluşturuldu!");
  await db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
