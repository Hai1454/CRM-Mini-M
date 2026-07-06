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

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
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

app.listen(port, () => {
  console.log(`CRM Mini API running at http://localhost:${port}`);
});
