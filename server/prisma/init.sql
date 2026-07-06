PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS "Ticket";
DROP TABLE IF EXISTS "Deal";
DROP TABLE IF EXISTS "CareHistory";
DROP TABLE IF EXISTS "OrderDetail";
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS "Product";
DROP TABLE IF EXISTS "CustomerManager";
DROP TABLE IF EXISTS "Customer";
DROP TABLE IF EXISTS "User";

CREATE TABLE "User" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "username" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'STAFF',
  "phone" TEXT,
  "title" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Customer" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "customerType" TEXT NOT NULL DEFAULT 'Potential',
  "source" TEXT NOT NULL DEFAULT 'Website',
  "status" TEXT NOT NULL DEFAULT 'Lead',
  "note" TEXT,
  "createdById" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

CREATE TABLE "CustomerManager" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "userId" INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerManager_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CustomerManager_userId_customerId_key" ON "CustomerManager"("userId", "customerId");

CREATE TABLE "Product" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "description" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

CREATE TABLE "Order" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "code" TEXT NOT NULL,
  "customerId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "staffId" INTEGER,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "total" INTEGER NOT NULL,
  "paymentStatus" TEXT NOT NULL DEFAULT 'Unpaid',
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Order_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Order_code_key" ON "Order"("code");

CREATE TABLE "OrderDetail" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "orderId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "CareHistory" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "customerId" INTEGER NOT NULL,
  "staffId" INTEGER,
  "type" TEXT NOT NULL DEFAULT 'Call',
  "summary" TEXT NOT NULL,
  "result" TEXT,
  "nextAction" TEXT,
  "nextSchedule" DATETIME,
  "careDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CareHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CareHistory_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Deal" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "stage" TEXT NOT NULL DEFAULT 'New',
  "expectedAt" DATETIME,
  "customerId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Deal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Ticket" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "subject" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "description" TEXT,
  "customerId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Ticket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
