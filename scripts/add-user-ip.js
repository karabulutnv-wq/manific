const { createClient } = require("@libsql/client");
require("dotenv").config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // SiteUser tablosuna lastIp kolonu ekle
  try {
    await db.execute("ALTER TABLE SiteUser ADD COLUMN lastIp TEXT");
    console.log("lastIp kolonu eklendi");
  } catch {
    console.log("lastIp zaten var veya hata (normal)");
  }
  await db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
