const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, name: true, email: true, role: true, phone: true, title: true, status: true }
    });
    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ message: "This account is not active." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

module.exports = auth;
