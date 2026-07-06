const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

const schema = z.object({
  title: z.string().min(2),
  value: z.coerce.number().int().nonnegative(),
  stage: z.string().min(2),
  customerId: z.coerce.number().int().positive()
});

router.get("/", auth, async (_req, res) => {
  const deals = await prisma.deal.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(deals);
});

router.post("/", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Du lieu co hoi khong hop le." });
  const deal = await prisma.deal.create({ data: parsed.data, include: { customer: true } });
  res.status(201).json(deal);
});

router.put("/:id", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Du lieu co hoi khong hop le." });
  const deal = await prisma.deal.update({
    where: { id: Number(req.params.id) },
    data: parsed.data,
    include: { customer: true }
  });
  res.json(deal);
});

router.delete("/:id", auth, async (req, res) => {
  await prisma.deal.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
