const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const prisma = require("../prisma");
const { canAccessCustomer, relationCustomerScope } = require("../utils/access");

const router = express.Router();

const schema = z.object({
  code: z.string().min(2),
  customerId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
  staffId: z.coerce.number().int().positive().optional().nullable(),
  quantity: z.coerce.number().int().positive(),
  total: z.coerce.number().int().nonnegative(),
  paymentStatus: z.string().min(2).optional().default("Unpaid"),
  status: z.string().min(2),
  note: z.string().optional().nullable()
});

const include = {
  customer: true,
  product: true,
  staff: { select: { id: true, name: true, email: true, role: true } },
  details: { include: { product: true } }
};

router.get("/", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        relationCustomerScope(req),
        q
          ? {
              OR: [
                { code: { contains: q } },
                { customer: { name: { contains: q } } },
                { product: { name: { contains: q } } }
              ]
            }
          : {}
      ]
    },
    include,
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
});

router.get("/:id", auth, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { AND: [{ id: Number(req.params.id) }, relationCustomerScope(req)] },
    include
  });
  if (!order) return res.status(404).json({ message: "Order was not found." });
  res.json(order);
});

router.post("/", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid order data." });
  if (!(await canAccessCustomer(prisma, req, parsed.data.customerId))) {
    return res.status(403).json({ message: "You are not assigned to this customer." });
  }
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return res.status(404).json({ message: "Product was not found." });

  const data = {
    ...parsed.data,
    total: parsed.data.total || product.price * parsed.data.quantity,
    staffId: req.user.role === "ADMIN" ? parsed.data.staffId || null : req.user.id,
    details: {
      create: [
        {
          productId: parsed.data.productId,
          quantity: parsed.data.quantity,
          unitPrice: product.price,
          totalPrice: parsed.data.total || product.price * parsed.data.quantity
        }
      ]
    }
  };
  const order = await prisma.order.create({ data, include });
  res.status(201).json(order);
});

router.put("/:id", auth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid order data." });
  if (!(await canAccessCustomer(prisma, req, parsed.data.customerId))) {
    return res.status(403).json({ message: "You are not assigned to this customer." });
  }
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return res.status(404).json({ message: "Product was not found." });
  const total = parsed.data.total || product.price * parsed.data.quantity;
  const id = Number(req.params.id);

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        ...parsed.data,
        total,
        staffId: req.user.role === "ADMIN" ? parsed.data.staffId || null : req.user.id
      }
    }),
    prisma.orderDetail.deleteMany({ where: { orderId: id } }),
    prisma.orderDetail.create({
      data: {
        orderId: id,
        productId: parsed.data.productId,
        quantity: parsed.data.quantity,
        unitPrice: product.price,
        totalPrice: total
      }
    })
  ]);
  const order = await prisma.order.findUnique({
    where: { id },
    include
  });
  res.json(order);
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin access is required." });
  await prisma.order.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
