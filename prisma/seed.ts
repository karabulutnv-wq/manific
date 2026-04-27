import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
