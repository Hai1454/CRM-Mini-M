# CRM Mini - Do an 1

Ung dung CRM Mini phuc vu do an thiet ke va phat trien phan mem chuyen nganh dien tu - vien thong.

## Chuc nang chinh

- Dang nhap bang JWT.
- Admin dashboard thong ke khach hang, don hang, doanh thu, khach hang moi.
- Staff dashboard ca nhan theo khach hang duoc phan cong.
- Quan ly khach hang: them, sua, xoa, xem chi tiet, tim kiem, gan nhan vien phu trach.
- Quan ly nhan vien: them, sua, xoa tai khoan staff, doi mat khau, phan quyen.
- Quan ly don hang: xem, them, sua, xoa va cap nhat trang thai.
- Quan ly san pham/dich vu.
- Lich su cham soc khach hang: cuoc goi, email, cuoc hen, ghi chu tu van.
- Bao cao thong ke doanh thu, don hang, khach hang theo trang thai.
- Backend Express + Prisma.
- Frontend React + Vite + Bootstrap.

## Cach chay tren may moi

Moi nguoi chi can clone/tai source ve may minh va cai Node.js LTS.

Tren Windows, bam dup file:

```text
start-crm-mini.bat
```

File nay se tu:

- Chuan bi pnpm neu may chua co.
- Cai dependency neu chua co.
- Tu tao `server/.env` neu chua co.
- Tao database SQLite local neu chua co.
- Nap du lieu mau.
- Khoi dong frontend/backend.
- Mo trinh duyet tai `http://localhost:5173`.

Neu muon chay bang terminal, dung:

```bash
pnpm run setup
```

Lenh nay se:

- Cai dependency.
- Tu tao `server/.env` neu chua co.
- Tao database SQLite local.
- Nap du lieu mau.

Sau do chay ung dung:

```bash
pnpm run dev
```

Mo trinh duyet tai:

```text
http://localhost:5173
```

Backend chay tai:

```text
http://localhost:4000
```

Moi may se co database demo rieng nam trong `server/prisma/dev.db`, nen khong can ket noi cung LAN va khong can truy cap may cua nhau.

## Cach chay thu cong

1. Cai dependency:

```bash
pnpm install
```

2. Tao database va du lieu mau:

```bash
pnpm --filter crm-mini-server run seed
```

3. Chay ung dung:

```bash
pnpm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:4000

## Tai khoan demo

- Email: `admin@crm.local`
- Mat khau: `123456`

Tai khoan staff mau:

- Email: `minhanh@crm.local`
- Mat khau: `123456`

- Email: `quocbao@crm.local`
- Mat khau: `123456`

## Ghi chu database

Du an dang dung SQLite de chay demo nhanh. Neu muon doi sang MySQL, cap nhat `provider` va `DATABASE_URL` trong `server/prisma/schema.prisma` va `server/.env`.

Tren Windows, neu Prisma `db push` gap loi do duong dan co dau tieng Viet, script seed da dung `prisma db execute` voi `server/prisma/init.sql` de tao bang thay the.

## Backend va database

Tai lieu API: `server/docs/backend-api.md`

SQL MySQL dung cho bao cao/do an: `server/docs/mysql-schema.sql`

Backend da co cac nhom API chinh:

- Auth: login, profile, logout.
- Customers: CRUD, search, filter by status.
- Customer history: CRUD, xem theo tung khach hang.
- Orders: CRUD, tao order kem order details.
- Products: CRUD cho admin.
- Users: quan ly tai khoan staff/admin.
- Dashboard: summary, revenue, customers, orders.

Mat khau duoc bam bcrypt, API dung JWT, va cac route admin/staff duoc kiem tra quyen.
