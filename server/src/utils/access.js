function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access is required." });
  }
  next();
}

function customerScope(req) {
  if (req.user.role === "ADMIN") return {};
  return { managers: { some: { userId: req.user.id } } };
}

function relationCustomerScope(req) {
  if (req.user.role === "ADMIN") return {};
  return { customer: { managers: { some: { userId: req.user.id } } } };
}

async function canAccessCustomer(prisma, req, customerId) {
  if (req.user.role === "ADMIN") return true;
  const assigned = await prisma.customerManager.findUnique({
    where: { userId_customerId: { userId: req.user.id, customerId } }
  });
  return Boolean(assigned);
}

module.exports = { adminOnly, canAccessCustomer, customerScope, relationCustomerScope };
