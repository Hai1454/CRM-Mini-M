require("dotenv").config();

const cors = require("cors");
const express = require("express");

const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customers.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const dealRoutes = require("./routes/deals.routes");
const careRoutes = require("./routes/care.routes");
const orderRoutes = require("./routes/orders.routes");
const productRoutes = require("./routes/products.routes");
const ticketRoutes = require("./routes/tickets.routes");
const userRoutes = require("./routes/users.routes");
const { ensureDefaultAdmin } = require("./utils/bootstrap");

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";
const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:5173$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultOrigins;
    const isAllowed = configuredOrigins.length
      ? allowedOrigins.some((allowed) => allowed === "*" || allowed === origin)
      : allowedOrigins.some((allowed) => (
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      ));
    callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
  }
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "CRM Mini API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/care-history", careRoutes);
app.use("/api/customer-history", careRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === "P2002") return res.status(409).json({ message: "This data already exists." });
  if (error.code === "P2025") return res.status(404).json({ message: "The requested data was not found." });
  res.status(500).json({ message: "Server error." });
});

ensureDefaultAdmin()
  .catch((error) => {
    console.error("Unable to bootstrap default admin account.", error);
  })
  .finally(() => {
    app.listen(port, host, () => {
      console.log(`CRM Mini API running at http://${host}:${port}`);
    });
  });
