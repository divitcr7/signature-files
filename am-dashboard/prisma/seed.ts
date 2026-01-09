import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const amNames = ["Andrea", "Mitchell", "Tara", "Kimberly", "Daniel", "Robert" ,"Divit"];
const months = ["2025-10", "2025-11", "2025-12"]; // adjust as you like

async function main() {
  // Clear data (order matters if you have relations later)
  await prisma.metricMonthly.deleteMany();
  await prisma.user.deleteMany();

  // Create Management users
  await prisma.user.createMany({
    data: [
      {
        name: "Maggie Manager",
        email: "maggie.manager@example.com",
        role: "MANAGEMENT",
        id: ""
      },
      {
        name: "Oscar Oversight",
        email: "oscar.management@example.com",
        role: "MANAGEMENT",
        id: ""
      },
    ],
  });

  // Create AM users
  for (const amName of amNames) {
    await prisma.user.create({
      data: {
        name: amName,
        email: `${amName.toLowerCase()}@benchmark.com`,
        role: "AM",
        id:""
      },
    });
  }

  
  // Create monthly metrics
for (const amName of amNames) {
  const email = `${amName.toLowerCase()}@benchmark.com`;

  // Ensure AccountManager exists
  const am = await prisma.accountManager.upsert({
    where: { email },
    update: { name: amName },
    create: { name: amName, email },
    select: { id: true },
  });

  for (const month of months) {
    await prisma.metricMonthly.create({
      data: {
        // ✅ if your schema has amName as a column, keep it; otherwise delete this line
        // amName,

        // ✅ if `month` is DateTime in schema, pass an actual Date:
        month: new Date(`${month}-01T00:00:00.000Z`),

        netRetention: Number((92 + Math.random() * 4).toFixed(2)),
        grossRetention: Number((95 + Math.random() * 3).toFixed(2)),
        renewalPremium: Math.round(50000 + Math.random() * 20000),
        lostPremium: Math.round(5000 + Math.random() * 5000),
        newBizPremium: Math.round(15000 + Math.random() * 7000),
        policyCountStart: 120 + Math.floor(Math.random() * 30),
        policyCountEnd: 120 + Math.floor(Math.random() * 30),

        // ✅ satisfy required relation using FK
        accountManagerId: am.id,
      },
    });
  }
}


  console.log("Seeded management, AM users, account managers, and metric data");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
