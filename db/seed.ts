import { drizzle } from "drizzle-orm/neon-http";
import { users, clients, invoices, invoiceItems } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log("Seeding database...");

  // Clear existing data (order matters for FKs)
  await db.delete(invoiceItems);
  await db.delete(invoices);
  await db.delete(clients);
  await db.delete(users);

  // Create user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const [user] = await db
    .insert(users)
    .values({
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    })
    .returning();
  console.log(`Created user: ${user.name} (${user.id})`);

  // Create clients
  const insertedClients = await db
    .insert(clients)
    .values([
      {
        userId: user.id,
        name: "Acme Corp",
        email: "billing@acme.com",
        phone: "+1-555-0101",
        address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
      },
      {
        userId: user.id,
        name: "Globex Corporation",
        email: "accounts@globex.com",
        phone: "+1-555-0102",
        address: "456 Industrial Blvd, Chicago, IL 60601",
      },
      {
        userId: user.id,
        name: "Initech",
        email: "finance@initech.com",
        phone: "+1-555-0103",
        address: "789 Office Park, Austin, TX 73301",
      },
      {
        userId: user.id,
        name: "Umbrella Inc",
        email: "ap@umbrella.com",
        phone: "+1-555-0104",
        address: "321 Corp Center, Raccoon City, ST 00000",
      },
      {
        userId: user.id,
        name: "Stark Industries",
        email: "invoices@stark.com",
        phone: "+1-555-0105",
        address: "200 Park Avenue, New York, NY 10166",
      },
      {
        userId: user.id,
        name: "Wayne Enterprises",
        email: "billing@wayne.com",
        phone: "+1-555-0106",
        address: "1007 Mountain Drive, Gotham, NJ 07001",
      },
    ])
    .returning();
  console.log(`Created ${insertedClients.length} clients`);

  // Create invoices with items
  const invoiceData = [
    {
      clientEmail: "billing@acme.com",
      number: 1001,
      status: "paid" as const,
      totalAmount: 125000,
      paidDaysAgo: 5,
      items: [
        { description: "Website redesign", quantity: 1, price: 75000 },
        { description: "SEO optimization", quantity: 1, price: 50000 },
      ],
    },
    {
      clientEmail: "accounts@globex.com",
      number: 1002,
      status: "sent" as const,
      totalAmount: 87500,
      items: [
        { description: "Mobile app development", quantity: 40, price: 2000 },
        { description: "API integration", quantity: 5, price: 7500 },
      ],
    },
    {
      clientEmail: "finance@initech.com",
      number: 1003,
      status: "paid" as const,
      totalAmount: 45000,
      paidDaysAgo: 12,
      items: [
        { description: "Consulting services (January)", quantity: 1, price: 45000 },
      ],
    },
    {
      clientEmail: "ap@umbrella.com",
      number: 1004,
      status: "sent" as const,
      totalAmount: 210000,
      items: [
        { description: "Cloud infrastructure setup", quantity: 1, price: 120000 },
        { description: "Security audit", quantity: 1, price: 60000 },
        { description: "Monitoring setup", quantity: 1, price: 30000 },
      ],
    },
    {
      clientEmail: "invoices@stark.com",
      number: 1005,
      status: "paid" as const,
      totalAmount: 350000,
      paidDaysAgo: 2,
      items: [
        { description: "AI model training", quantity: 1, price: 200000 },
        { description: "Data pipeline development", quantity: 1, price: 150000 },
      ],
    },
    {
      clientEmail: "billing@wayne.com",
      number: 1006,
      status: "sent" as const,
      totalAmount: 67500,
      items: [
        { description: "UI/UX design review", quantity: 15, price: 4500 },
      ],
    },
    {
      clientEmail: "billing@acme.com",
      number: 1007,
      status: "paid" as const,
      totalAmount: 98000,
      paidDaysAgo: 8,
      items: [
        { description: "Database migration", quantity: 1, price: 48000 },
        { description: "Performance optimization", quantity: 1, price: 50000 },
      ],
    },
    {
      clientEmail: "accounts@globex.com",
      number: 1008,
      status: "sent" as const,
      totalAmount: 155000,
      items: [
        { description: "E-commerce platform build", quantity: 1, price: 100000 },
        { description: "Payment gateway integration", quantity: 1, price: 35000 },
        { description: "Testing & QA", quantity: 1, price: 20000 },
      ],
    },
  ];

  for (const inv of invoiceData) {
    const client = insertedClients.find((c) => c.email === inv.clientEmail);
    if (!client) continue;

    const paidAt = inv.paidDaysAgo
      ? new Date(Date.now() - inv.paidDaysAgo * 86400000)
      : null;

    const [invoice] = await db
      .insert(invoices)
      .values({
        number: inv.number,
        userId: user.id,
        clientId: client.id,
        status: inv.status,
        totalAmount: inv.totalAmount,
        paidAt,
      })
      .returning();

    await db.insert(invoiceItems).values(
      inv.items.map((item) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    console.log(
      `Created invoice #${inv.number} for ${client.name} (${inv.status})`,
    );
  }

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
