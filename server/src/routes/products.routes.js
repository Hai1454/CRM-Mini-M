const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const prisma = require("../prisma");
const { adminOnly } = require("../utils/access");

const router = express.Router();

const schema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().int().nonnegative(),
  status: z.string().min(2),
  description: z.string().optional().nullable()
});

router.get("/", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const products = await prisma.product.findMany({
    where: q
      ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { category: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" }
  });
  res.json(products);
});

router.get("/:id", auth, async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
  if (!product) return res.status(404).json({ message: "Product was not found." });
  res.json(product);
});

router.post("/", auth, adminOnly, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid product data." });
  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid product data." });
  const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data: parsed.data });
  res.json(product);
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
