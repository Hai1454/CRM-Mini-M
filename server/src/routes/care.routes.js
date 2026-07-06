const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const prisma = require("../prisma");
const { canAccessCustomer, relationCustomerScope } = require("../utils/access");

const router = express.Router();

const schema = z.object({
  customerId: z.coerce.number().int().positive(),
  staffId: z.coerce.number().int().positive().optional().nullable(),
  type: z.string().min(2),
  summary: z.string().min(2),
  result: z.string().optional().nullable(),
  nextAction: z.string().optional().nullable(),
  nextSchedule: z.string().optional().nullable(),
  careDate: z.string().optional().nullable()
});

const include = {
  customer: true,
  staff: { select: { id: true, name: true, email: true, role: true } }
};

router.get("/", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const history = await prisma.careHistory.findMany({
    where: {
      AND: [
        relationCustomerScope(req),
        q
          ? {
              OR: [
                { summary: { contains: q } },
                { type: { contains: q } },
                { customer: { name: { contains: q } } }
              ]
            }
          : {}
      ]
    },
    include,
    orderBy: { careDate: "desc" }
  });
  res.json(history);
});

router.get("/customer/:customerId", auth, async (req, res) => {
  const customerId = Number(req.params.customerId);
  if (!(await canAccessCustomer(prisma, req, customerId))) {
    return res.status(403).json({ message: "You are not assigned to this customer." });
  }
  const history = await prisma.careHistory.findMany({
    where: { customerId },
    include,
    orderBy: { careDate: "desc" }
  });
  res.json(history);
});

router.get("/:id", auth, async (req, res) => {
  const item = await prisma.careHistory.findFirst({
    where: { AND: [{ id: Number(req.params.id) }, relationCustomerScope(req)] },
    include
  });
  if (!item) return res.status(404).json({ message: "Care history item was not found." });
  res.json(item);
});

router.post("/", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid care history data." });
  if (!(await canAccessCustomer(prisma, req, parsed.data.customerId))) {
    return res.status(403).json({ message: "You are not assigned to this customer." });
  }
  const care = await prisma.careHistory.create({
    data: {
      ...parsed.data,
      staffId: req.user.role === "ADMIN" ? parsed.data.staffId || null : req.user.id,
      careDate: parsed.data.careDate ? new Date(parsed.data.careDate) : new Date(),
      nextSchedule: parsed.data.nextSchedule ? new Date(parsed.data.nextSchedule) : null
    },
    include
  });
  res.status(201).json(care);
});

router.put("/:id", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid care history data." });
  if (!(await canAccessCustomer(prisma, req, parsed.data.customerId))) {
    return res.status(403).json({ message: "You are not assigned to this customer." });
  }
  const care = await prisma.careHistory.update({
    where: { id: Number(req.params.id) },
    data: {
      ...parsed.data,
      staffId: req.user.role === "ADMIN" ? parsed.data.staffId || null : req.user.id,
      careDate: parsed.data.careDate ? new Date(parsed.data.careDate) : new Date(),
      nextSchedule: parsed.data.nextSchedule ? new Date(parsed.data.nextSchedule) : null
    },
    include
  });
  res.json(care);
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin access is required." });
  await prisma.careHistory.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
