const { createClient } = require("@libsql/client");
require("dotenv").config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Comment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapterId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      username TEXT NOT NULL,
      avatar TEXT,
      content TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapterId) REFERENCES Chapter(id) ON DELETE CASCADE
    )
  `);
  console.log("Comment tablosu oluşturuldu!");
  await db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
