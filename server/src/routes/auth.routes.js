const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const router = express.Router();

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1)
});

const profileSchema = z.object({
  username: z.string().min(2).optional().nullable(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable()
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid login data." });

  const identifier = parsed.data.email.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
  if (!user) return res.status(401).json({ message: "Email or password is incorrect." });
  if (user.status !== "ACTIVE") return res.status(403).json({ message: "This account is not active." });

  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ message: "Email or password is incorrect." });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, status: user.status },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      title: user.title,
      status: user.status
    }
  });
});

router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

router.get("/profile", auth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", auth, (_req, res) => {
  res.json({ message: "Logged out successfully. Please remove the token on the client." });
});

router.put("/profile", auth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid profile data." });

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: parsed.data,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      title: true,
      status: true
    }
  });
  res.json({ user });
});

router.patch("/password", auth, async (req, res) => {
  const parsed = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid password data." });

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!ok) return res.status(401).json({ message: "Current password is incorrect." });

  const password = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: req.user.id }, data: { password } });
  res.json({ message: "Password was updated." });
});

module.exports = router;
