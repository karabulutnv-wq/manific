// Run locally after setting TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env
// node prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.siteUser.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: { username: "testuser", email: "test@test.com", password: hashed },
  });
  console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
