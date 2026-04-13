import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────
  const password = process.env.ADMIN_PASSWORD ?? "changeme123!";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: "eswanberg0@gmail.com" },
    update: {},
    create: {
      email: "eswanberg0@gmail.com",
      password: hash,
      name: "Swany Admin",
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ Admin: eswanberg0@gmail.com / ${password}`);

  // ── 25 Rep slots ─────────────────────────────────────────
  // Uses upsert — existing reps with real data will NOT be overwritten.
  // New slots are created as inactive placeholders ready to be assigned.
  for (let i = 1; i <= 25; i++) {
    await prisma.rep.upsert({
      where: { id: i },
      update: {},
      create: {
        id: i,
        name: `Rep ${i}`,
        title: "Sales Rep",
        company: "Swany Roofing",
        isActive: false,
      },
    });

    // Register a tag in inventory for each slot
    await prisma.tag.upsert({
      where: { uid: `rep-slot-${i}` },
      update: {},
      create: {
        uid: `rep-slot-${i}`,
        label: `Rep ${i} House Card`,
        type: "REP",
        repId: i,
        notes: "NTAG216 38mm wet inlay",
      },
    });
  }

  console.log("✅ 25 rep slots seeded (IDs 1–25)");
  console.log("📡 NFC URLs: /r/1 through /r/25");
  console.log("\n⚠️  Edit each rep in the admin dashboard to assign real names/info.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
