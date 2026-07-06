const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

const schema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().optional().nullable(),
  customerType: z.string().optional().nullable(),
  source: z.string().min(2),
  status: z.string().min(2),
  note: z.string().optional().nullable(),
  managerIds: z.array(z.coerce.number().int().positive()).optional()
});

const includeManagers = {
  managers: {
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, phone: true, title: true, status: true }
      }
    }
  }
};

function serialize(customer) {
  return {
    ...customer,
    managerIds: customer.managers?.map((manager) => manager.userId) || [],
    managers: customer.managers?.map((manager) => manager.user) || []
  };
}

router.get("/", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const searchWhere = q
    ? {
        OR: [
          { name: { contains: q } },
          { company: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { address: { contains: q } }
        ]
      }
    : {};
  const status = String(req.query.status || "").trim();
  const statusWhere = status ? { status } : {};

  const customers = await prisma.customer.findMany({
    where:
      req.user.role === "ADMIN"
        ? { AND: [searchWhere, statusWhere] }
        : {
            AND: [
              searchWhere,
              statusWhere,
              { managers: { some: { userId: req.user.id } } }
            ]
          },
    include: includeManagers,
    orderBy: { createdAt: "desc" }
  });
  res.json(customers.map(serialize));
});

router.get("/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const customer = await prisma.customer.findFirst({
    where:
      req.user.role === "ADMIN"
        ? { id }
        : { id, managers: { some: { userId: req.user.id } } },
    include: includeManagers
  });
  if (!customer) return res.status(404).json({ message: "Customer was not found." });
  res.json(serialize(customer));
});

router.post("/", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid customer data." });

  const { managerIds = [], ...data } = parsed.data;
  const allowedManagerIds = req.user.role === "ADMIN" ? managerIds : [req.user.id];
  const customer = await prisma.customer.create({
    data: {
      ...data,
      customerType: data.customerType || "Potential",
      createdById: req.user.id,
      managers: {
        create: allowedManagerIds.map((userId) => ({ userId }))
      }
    },
    include: includeManagers
  });
  res.status(201).json(serialize(customer));
});

router.put("/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid customer data." });

  if (req.user.role !== "ADMIN") {
    const allowed = await prisma.customerManager.findUnique({
      where: { userId_customerId: { userId: req.user.id, customerId: id } }
    });
    if (!allowed) return res.status(403).json({ message: "You are not assigned to this customer." });
  }

  const { managerIds, ...data } = parsed.data;
  const customer = await prisma.customer.update({ where: { id }, data, include: includeManagers });

  if (req.user.role === "ADMIN" && managerIds) {
    await prisma.customerManager.deleteMany({ where: { customerId: id } });
    await Promise.all(managerIds.map((userId) => prisma.customerManager.create({ data: { userId, customerId: id } })));
    const refreshed = await prisma.customer.findUnique({ where: { id }, include: includeManagers });
    return res.json(serialize(refreshed));
  }

  res.json(serialize(customer));
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin access is required." });
  await prisma.customer.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
