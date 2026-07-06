const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

const schema = z.object({
  subject: z.string().min(2),
  priority: z.string().min(2),
  status: z.string().min(2),
  description: z.string().optional().nullable(),
  customerId: z.coerce.number().int().positive()
});

router.get("/", auth, async (_req, res) => {
  const tickets = await prisma.ticket.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(tickets);
});

router.post("/", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Du lieu ticket khong hop le." });
  const ticket = await prisma.ticket.create({ data: parsed.data, include: { customer: true } });
  res.status(201).json(ticket);
});

router.put("/:id", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Du lieu ticket khong hop le." });
  const ticket = await prisma.ticket.update({
    where: { id: Number(req.params.id) },
    data: parsed.data,
    include: { customer: true }
  });
  res.json(ticket);
});

router.delete("/:id", auth, async (req, res) => {
  await prisma.ticket.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
