import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { notifyCrmDataChanged } from "../utils/dataEvents.js";

const blank = { code: "", customerId: "", productId: "", staffId: "", quantity: 1, total: 0, paymentStatus: "Unpaid", status: "Draft", note: "" };
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const isAdmin = user?.role === "ADMIN";
  const selectedProduct = useMemo(() => products.find((item) => item.id === Number(form.productId)), [products, form.productId]);

  async function load() {
    const [orderRes, customerRes, productRes, staffRes] = await Promise.all([
      http.get("/orders", { params: { q: query } }),
      http.get("/customers"),
      http.get("/products"),
      isAdmin ? http.get("/users") : Promise.resolve({ data: [] })
    ]);
    setOrders(orderRes.data);
    setCustomers(customerRes.data);
    setProducts(productRes.data);
    setStaff(staffRes.data);
    if (!selectedId && orderRes.data[0]) pick(orderRes.data[0]);
  }

  useEffect(() => { load(); }, []);

  function pick(order) {
    setSelectedId(order.id);
    setForm({
      code: order.code,
      customerId: order.customerId,
      productId: order.productId,
      staffId: order.staffId || "",
      quantity: order.quantity,
      total: order.total,
      paymentStatus: order.paymentStatus || "Unpaid",
      status: order.status,
      note: order.note || ""
    });
  }

  function reset() {
    setSelectedId(null);
    setForm({ ...blank, code: `ORD-${Date.now().toString().slice(-5)}` });
  }

  function updateProduct(productId) {
    const product = products.find((item) => item.id === Number(productId));
    const quantity = Number(form.quantity) || 1;
    setForm({ ...form, productId, total: product ? product.price * quantity : form.total });
  }

  function updateQuantity(quantity) {
    const nextQuantity = Number(quantity) || 1;
    setForm({ ...form, quantity: nextQuantity, total: selectedProduct ? selectedProduct.price * nextQuantity : form.total });
  }

  async function submit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      customerId: Number(form.customerId),
      productId: Number(form.productId),
      staffId: form.staffId ? Number(form.staffId) : null,
      quantity: Number(form.quantity),
      total: Number(form.total),
      paymentStatus: form.paymentStatus
    };
    if (selectedId) await http.put(`/orders/${selectedId}`, payload);
    else await http.post("/orders", payload);
    setMessage("Order saved successfully.");
    notifyCrmDataChanged("orders");
    await load();
  }

  async function remove() {
    if (!isAdmin || !selectedId || !confirm("Delete this order?")) return;
    await http.delete(`/orders/${selectedId}`);
    setMessage("Order deleted successfully.");
    notifyCrmDataChanged("orders");
    reset();
    await load();
  }

  return (
    <div className="split-page">
      <section className="panel list-panel">
        <div className="panel-head">
          <h1>Orders</h1>
          <button className="btn btn-primary" onClick={reset}><Plus size={16} /> New</button>
        </div>
        <div className="d-flex gap-2 mb-3">
          <input className="form-control" placeholder="Search orders" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-outline-primary" onClick={load}>Search</button>
        </div>
        {orders.length === 0 ? <EmptyState title="No orders" /> : (
          <div className="record-list">
            {orders.map((order) => (
              <button key={order.id} className={`record-row ${selectedId === order.id ? "active" : ""}`} onClick={() => pick(order)}>
                <strong>{order.code}</strong>
                <span>{order.customer?.name} | {order.product?.name}</span>
                <small>{money.format(order.total)} | {order.paymentStatus} | {order.status}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel detail-panel">
        <div className="panel-head">
          <h2>{selectedId ? "Order Details" : "Create Order"}</h2>
          {isAdmin && selectedId && <button className="btn btn-outline-danger" onClick={remove}><Trash2 size={16} /> Delete</button>}
        </div>
        {message && <div className="alert alert-success py-2">{message}</div>}
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-4"><label className="form-label">Order code</label><input className="form-control" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">Customer</label><select className="form-select" required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select customer</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Product</label><select className="form-select" required value={form.productId} onChange={(e) => updateProduct(e.target.value)}><option value="">Select product</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          {isAdmin && <div className="col-md-4"><label className="form-label">Responsible staff</label><select className="form-select" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}><option value="">Unassigned</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>}
          <div className="col-md-2"><label className="form-label">Quantity</label><input className="form-control" type="number" min="1" value={form.quantity} onChange={(e) => updateQuantity(e.target.value)} /></div>
          <div className="col-md-3"><label className="form-label">Total</label><input className="form-control" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Payment</label><select className="form-select" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}><option>Unpaid</option><option>Paid</option><option>Refunded</option></select></div>
          <div className="col-md-3"><label className="form-label">Order status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Draft</option><option>Processing</option><option>Completed</option><option>Cancelled</option></select></div>
          {selectedId && (
            <div className="col-12">
              <label className="form-label">Order details</label>
              <div className="summary-list">
                {orders.find((order) => order.id === selectedId)?.details?.map((detail) => (
                  <div key={detail.id}>
                    <span>{detail.product?.name} x {detail.quantity}</span>
                    <strong>{money.format(detail.totalPrice)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="col-12"><label className="form-label">Note</label><textarea className="form-control" rows="3" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
          <div className="col-12"><button className="btn btn-primary"><Save size={16} /> Save order</button></div>
        </form>
      </section>
    </div>
  );
}
