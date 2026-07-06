const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../src/generated/prisma-runtime");

const prisma = new PrismaClient();

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.careHistory.deleteMany();
  await prisma.orderDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerManager.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "System Administrator",
      email: "admin@crm.local",
      password,
      role: "ADMIN",
      phone: "0900000000",
      title: "CRM Admin",
      status: "ACTIVE"
    }
  });

  const staffPassword = await bcrypt.hash("123456", 10);
  const staff = await Promise.all([
    prisma.user.create({
      data: {
        name: "Nguyễn Minh Anh",
        username: "minhanh",
        email: "minhanh@crm.local",
        password: staffPassword,
        role: "STAFF",
        phone: "0911111111",
        title: "Sales Executive",
        status: "ACTIVE"
      }
    }),
    prisma.user.create({
      data: {
        name: "Trần Quốc Bảo",
        username: "quocbao",
        email: "quocbao@crm.local",
        password: staffPassword,
        role: "STAFF",
        phone: "0922222222",
        title: "Customer Support",
        status: "ACTIVE"
      }
    })
  ]);

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Nguyễn Văn An",
        company: "Viettel Solutions",
        email: "an.nguyen@example.com",
        phone: "0901234567",
        address: "Hà Nội",
        customerType: "Purchased",
        source: "Conference",
        status: "Customer",
        note: "Quan tâm giải pháp quản lý thiết bị mạng.",
        createdById: staff[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: "Trần Thị Bình",
        company: "FPT Telecom",
        email: "binh.tran@example.com",
        phone: "0912345678",
        address: "TP. Hồ Chí Minh",
        customerType: "Consulting",
        source: "Website",
        status: "Lead",
        note: "Cần demo hệ thống CRM nội bộ.",
        createdById: staff[0].id
      }
    }),
    prisma.customer.create({
      data: {
        name: "Lê Minh Khoa",
        company: "VNPT Technology",
        email: "khoa.le@example.com",
        phone: "0987654321",
        address: "Đà Nẵng",
        customerType: "Potential",
        source: "Referral",
        status: "Prospect",
        note: "Đang so sánh giá và tính năng.",
        createdById: staff[1].id
      }
    })
  ]);

  await prisma.customerManager.createMany({
    data: [
      { userId: staff[0].id, customerId: customers[0].id },
      { userId: staff[0].id, customerId: customers[1].id },
      { userId: staff[1].id, customerId: customers[2].id }
    ]
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "CRM Starter Package",
        sku: "CRM-STARTER",
        category: "Software",
        price: 12000000,
        status: "Active",
        description: "Basic CRM setup for a small sales team."
      }
    }),
    prisma.product.create({
      data: {
        name: "Network Device Management",
        sku: "NET-MGMT",
        category: "Service",
        price: 28000000,
        status: "Active",
        description: "Device inventory and monitoring module."
      }
    }),
    prisma.product.create({
      data: {
        name: "Helpdesk Integration",
        sku: "HELPDESK",
        category: "Service",
        price: 18000000,
        status: "Active",
        description: "Support ticket and care history integration."
      }
    })
  ]);

  await Promise.all([
    prisma.order.create({
      data: {
        code: "ORD-1001",
        customerId: customers[0].id,
        productId: products[1].id,
        staffId: staff[0].id,
        quantity: 1,
        total: 28000000,
        paymentStatus: "Paid",
        status: "Completed",
        note: "Triển khai cho phòng kỹ thuật.",
        details: {
          create: [{ productId: products[1].id, quantity: 1, unitPrice: 28000000, totalPrice: 28000000 }]
        }
      }
    }),
    prisma.order.create({
      data: {
        code: "ORD-1002",
        customerId: customers[1].id,
        productId: products[0].id,
        staffId: staff[0].id,
        quantity: 2,
        total: 24000000,
        paymentStatus: "Unpaid",
        status: "Processing",
        note: "Chờ xác nhận lịch demo.",
        details: {
          create: [{ productId: products[0].id, quantity: 2, unitPrice: 12000000, totalPrice: 24000000 }]
        }
      }
    }),
    prisma.order.create({
      data: {
        code: "ORD-1003",
        customerId: customers[2].id,
        productId: products[2].id,
        staffId: staff[1].id,
        quantity: 1,
        total: 18000000,
        paymentStatus: "Unpaid",
        status: "Draft",
        note: "Báo giá sơ bộ.",
        details: {
          create: [{ productId: products[2].id, quantity: 1, unitPrice: 18000000, totalPrice: 18000000 }]
        }
      }
    })
  ]);

  await prisma.careHistory.createMany({
    data: [
      {
        customerId: customers[0].id,
        staffId: staff[0].id,
        type: "Call",
        summary: "Trao đổi yêu cầu quản lý thiết bị mạng.",
        result: "Customer requested technical proposal.",
        nextAction: "Send technical proposal"
      },
      {
        customerId: customers[1].id,
        staffId: staff[0].id,
        type: "Meeting",
        summary: "Demo CRM Starter cho đội kinh doanh.",
        result: "Customer is considering the starter package.",
        nextAction: "Confirm quotation"
      },
      {
        customerId: customers[2].id,
        staffId: staff[1].id,
        type: "Email",
        summary: "Gửi tài liệu tích hợp helpdesk.",
        result: "Waiting for customer response.",
        nextAction: "Follow up next week"
      }
    ]
  });

  await prisma.deal.createMany({
    data: [
      { title: "Goi CRM phong kinh doanh", value: 45000000, stage: "Won", customerId: customers[0].id },
      { title: "Tich hop ticket helpdesk", value: 28000000, stage: "Negotiation", customerId: customers[1].id },
      { title: "Dao tao van hanh CRM", value: 15000000, stage: "Proposal", customerId: customers[2].id }
    ]
  });

  await prisma.ticket.createMany({
    data: [
      { subject: "Can cap lai tai khoan nhan vien", priority: "High", status: "Open", customerId: customers[0].id },
      { subject: "Hoi ve tich hop email", priority: "Medium", status: "In Progress", customerId: customers[1].id },
      { subject: "Yeu cau bao cao doanh thu", priority: "Low", status: "Closed", customerId: customers[2].id }
    ]
  });
}

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
      console.log("Seed data created.");
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = main;
module.exports.disconnect = () => prisma.$disconnect();
