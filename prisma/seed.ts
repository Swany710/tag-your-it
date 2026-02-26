import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
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

  console.log(`✅ Admin user: eswanberg0@gmail.com / ${password}`);
  console.log("   ⚠️  Change this password immediately in production!");

  // Create 4 test reps
  const reps = [
    { id: 1, name: "Rep One", phone: "555-111-1111", email: "rep1@example.com", title: "Project Manager", company: "Swany Roofing" },
    { id: 2, name: "Rep Two", phone: "555-222-2222", email: "rep2@example.com", title: "Sales Rep", company: "Swany Roofing" },
    { id: 3, name: "Rep Three", phone: "555-333-3333", email: "rep3@example.com", title: "Sales Rep", company: "Swany Roofing" },
    { id: 4, name: "Rep Four", phone: "555-444-4444", email: "rep4@example.com", title: "Sales Rep", company: "Swany Roofing" },
  ];

  for (const rep of reps) {
    await prisma.rep.upsert({
      where: { id: rep.id },
      update: rep,
      create: rep,
    });
    console.log(`✅ Rep #${rep.id}: ${rep.name} → /r/${rep.id}`);
  }

  // Register their tags in inventory
  for (const rep of reps) {
    await prisma.tag.upsert({
      where: { uid: `test-rep-${rep.id}` },
      update: {},
      create: {
        uid: `test-rep-${rep.id}`,
        label: `${rep.name} House Card`,
        type: "REP",
        repId: rep.id,
        notes: "38mm NTAG216 wet inlay — test phase",
      },
    });
  }

  console.log("\n📡 NFC Tag URLs:");
  console.log("   /r/1  /r/2  /r/3  /r/4");
  console.log("\nReplace these with your actual domain when live.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
