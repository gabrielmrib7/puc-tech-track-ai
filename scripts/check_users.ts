import { prisma } from "../src/shared/infrastructure/database/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS:", JSON.stringify(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })), null, 2));

  const customers = await prisma.customer.findMany();
  console.log("CUSTOMERS:", JSON.stringify(customers.map(c => ({ id: c.id, name: c.name, email: c.email, user_id: c.user_id })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
