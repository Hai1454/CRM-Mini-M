const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", "server", ".env");
const envExamplePath = path.join(__dirname, "..", "server", ".env.example");

const fallbackEnv = [
  'DATABASE_URL="file:./dev.db"',
  'JWT_SECRET="crm-mini-demo-secret"',
  "PORT=4000",
  "HOST=0.0.0.0",
  ""
].join("\n");

if (!fs.existsSync(envPath)) {
  const content = fs.existsSync(envExamplePath)
    ? fs.readFileSync(envExamplePath, "utf8")
    : fallbackEnv;
  fs.writeFileSync(envPath, content);
  console.log("Created server/.env for local demo use.");
} else {
  console.log("server/.env already exists.");
}
