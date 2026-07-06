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

## Cach chay

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

## Truy cap tu may khac trong cung mang LAN

Ung dung da cau hinh de listen tren tat ca dia chi mang cua may chay server.

1. Tren may dang chay ung dung, lay dia chi IPv4 LAN:

```bash
ipconfig
```

Vi du IPv4 la `192.168.1.20`.

2. May khac trong cung Wi-Fi/LAN truy cap:

```text
http://192.168.1.20:5173
```

Frontend se tu goi backend theo cung IP:

```text
http://192.168.1.20:4000/api
```

Neu van khong vao duoc, cho phep firewall cua Windows mo port `5173` va `4000` cho Node.js.

Co the gan API rieng bang bien moi truong frontend:

```bash
VITE_API_URL=http://192.168.1.20:4000/api
```

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
