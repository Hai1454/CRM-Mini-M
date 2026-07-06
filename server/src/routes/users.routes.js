const bcrypt = require("bcryptjs");
const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const prisma = require("../prisma");

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access is required." });
  }
  next();
}

const userSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  title: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

const optionalText = z.preprocess((value) => (value === "" ? null : value), z.string().min(2).optional().nullable());

const createSchema = z.object({
  username: optionalText,
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
  managedCustomerIds: z.array(z.coerce.number().int().positive()).optional()
});

const updateSchema = createSchema.omit({ password: true }).extend({
  managedCustomerIds: z.array(z.coerce.number().int().positive()).optional()
});

function userWithPermissions(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      ...userSelect,
      managedCustomers: { include: { customer: true } }
    }
  });
}

router.get("/me", auth, async (req, res) => {
  const [managedCount, customerCount, staffCount] = await Promise.all([
    prisma.customerManager.count({ where: { userId: req.user.id } }),
    prisma.customer.count(),
    prisma.user.count({ where: { role: "STAFF" } })
  ]);

  res.json({
    user: req.user,
    stats: {
      managedCustomers: req.user.role === "ADMIN" ? customerCount : managedCount,
      staffAccounts: staffCount
    }
  });
});

router.get("/", auth, adminOnly, async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: "STAFF" },
    select: {
      ...userSelect,
      managedCustomers: {
        include: { customer: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(users);
});

router.post("/", auth, adminOnly, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid employee account data." });

  const { managedCustomerIds = [], ...userData } = parsed.data;
  const password = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { ...userData, password },
    select: userSelect
  });

  if (managedCustomerIds.length > 0) {
    await Promise.all(
      managedCustomerIds.map((customerId) => prisma.customerManager.create({ data: { userId: user.id, customerId } }))
    );
  }

  res.status(201).json(await userWithPermissions(user.id));
});

router.get("/:id", auth, adminOnly, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      ...userSelect,
      managedCustomers: { include: { customer: true } }
    }
  });
  if (!user) return res.status(404).json({ message: "Employee account was not found." });
  res.json(user);
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid employee account data." });

  const { managedCustomerIds, ...data } = parsed.data;
  await prisma.user.update({ where: { id }, data, select: userSelect });

  if (managedCustomerIds !== undefined) {
    await prisma.customerManager.deleteMany({ where: { userId: id } });
    if (managedCustomerIds.length > 0) {
      await Promise.all(
        managedCustomerIds.map((customerId) => prisma.customerManager.create({ data: { userId: id, customerId } }))
      );
    }
  }

  res.json(await userWithPermissions(id));
});

router.patch("/:id/password", auth, adminOnly, async (req, res) => {
  const parsed = z.object({ password: z.string().min(6) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Password must have at least 6 characters." });

  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: Number(req.params.id) }, data: { password } });
  res.json({ message: "Password was updated." });
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: "You cannot delete your own admin account." });
  await prisma.user.delete({ where: { id } });
  res.status(204).end();
});

module.exports = router;
