const bcrypt = require("bcryptjs");
const prisma = require("../prisma");

async function ensureDefaultAdmin() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  const password = await bcrypt.hash("123456", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      name: "System Administrator",
      email: "admin@crm.local",
      password,
      role: "ADMIN",
      phone: "0900000000",
      title: "CRM Admin",
      status: "ACTIVE"
    }
  });
  console.log("Created default admin account for empty database.");
}

module.exports = { ensureDefaultAdmin };
