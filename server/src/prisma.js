const { PrismaClient } = require("./generated/prisma-runtime");

const prisma = new PrismaClient();

module.exports = prisma;
