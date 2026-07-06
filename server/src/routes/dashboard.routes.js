const express = require("express");
const prisma = require("../prisma");
const auth = require("../middleware/auth");
const { customerScope, relationCustomerScope } = require("../utils/access");

const router = express.Router();

async function getDashboard(req) {
  const customerWhere = customerScope(req);
  const relationWhere = relationCustomerScope(req);

  const [customers, orders, completedOrders, products, careItems, recentCustomers, recentOrders] = await Promise.all([
    prisma.customer.count({ where: customerWhere }),
    prisma.order.count({ where: relationWhere }),
    prisma.order.findMany({ where: { AND: [relationWhere, { status: "Completed" }] } }),
    prisma.product.count(),
    prisma.careHistory.count({ where: relationWhere }),
    prisma.customer.findMany({ where: customerWhere, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.findMany({
      where: relationWhere,
      include: { customer: true, product: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    role: req.user.role,
    stats: { customers, orders, products, careItems, revenue },
    recentCustomers,
    recentOrders
  };
}

router.get("/", auth, async (req, res) => {
  res.json(await getDashboard(req));
});

router.get("/summary", auth, async (req, res) => {
  const data = await getDashboard(req);
  res.json(data.stats);
});

router.get("/revenue", auth, async (req, res) => {
  const relationWhere = relationCustomerScope(req);
  const completed = await prisma.order.findMany({
    where: { AND: [relationWhere, { status: "Completed" }] },
    orderBy: { createdAt: "asc" }
  });

  const byMonth = completed.reduce((acc, order) => {
    const month = order.createdAt.toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + order.total;
    return acc;
  }, {});

  res.json({
    totalRevenue: completed.reduce((sum, order) => sum + order.total, 0),
    byMonth: Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue }))
  });
});

router.get("/customers", auth, async (req, res) => {
  const where = customerScope(req);
  const customers = await prisma.customer.findMany({ where });
  const byStatus = customers.reduce((acc, customer) => {
    acc[customer.status] = (acc[customer.status] || 0) + 1;
    return acc;
  }, {});
  res.json({
    total: customers.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count }))
  });
});

router.get("/orders", auth, async (req, res) => {
  const where = relationCustomerScope(req);
  const orders = await prisma.order.findMany({ where, include: { customer: true, details: true }, orderBy: { createdAt: "desc" } });
  const byStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  res.json({
    total: orders.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    recentOrders: orders.slice(0, 10)
  });
});

module.exports = router;
