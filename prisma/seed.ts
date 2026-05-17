import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.join(process.cwd(), ".env") });
config({ path: path.join(process.cwd(), ".env.local") });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) } as any);

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const username = process.env.ADMIN_USERNAME!;
  const password = process.env.ADMIN_PASSWORD!;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { isAdmin: true },
    });
    console.log(`✅ Admin updated: ${username}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, username, password: hashed, isAdmin: true },
  });
  console.log(`✅ Admin created: ${username}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
