const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@manga.com" },
    update: {},
    create: {
      email: "admin@manga.com",
      password: hashed,
      role: "admin",
    },
  });
  console.log("Admin user created: admin@manga.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
