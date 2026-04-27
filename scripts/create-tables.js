const { createClient } = require("@libsql/client");
require("dotenv").config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS Manga (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      cover TEXT,
      genre TEXT,
      status TEXT NOT NULL DEFAULT 'ongoing',
      author TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS Chapter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mangaId INTEGER NOT NULL,
      number REAL NOT NULL,
      title TEXT,
      pages TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mangaId) REFERENCES Manga(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS SiteUser (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS Avatar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      name TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of statements) {
    await db.execute(sql);
    console.log("✓", sql.trim().split("\n")[0]);
  }

  console.log("\nTüm tablolar oluşturuldu!");
  await db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
