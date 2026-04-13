const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = process.env.ADMIN_PASSWORD || "changeme123!";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_PASSWORD is not set. Using the default password. Set ADMIN_PASSWORD in Railway before deploying."
    );
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: "eswanberg0@gmail.com" },
    update: {
      password: hash,
      name: "Swany Admin",
      role: "SUPER_ADMIN",
    },
    create: {
      email: "eswanberg0@gmail.com",
      password: hash,
      name: "Swany Admin",
      role: "SUPER_ADMIN",
    },
  });

  console.log("Admin user ensured: eswanberg0@gmail.com");

  for (let i = 1; i <= 25; i += 1) {
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

  console.log("25 rep slots ensured (IDs 1-25).");
  console.log("NFC URLs ready: /r/1 through /r/25");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
