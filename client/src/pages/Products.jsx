import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { notifyCrmDataChanged } from "../utils/dataEvents.js";

const blank = { name: "", sku: "", category: "Software", price: 0, status: "Active", description: "" };
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function Products() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const isAdmin = user?.role === "ADMIN";

  async function load() {
    const { data } = await http.get("/products", { params: { q: query } });
    setItems(data);
    if (!selectedId && data[0]) pick(data[0]);
  }

  useEffect(() => { load(); }, []);

  function pick(item) {
    setSelectedId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      price: item.price,
      status: item.status,
      description: item.description || ""
    });
  }

  function reset() {
    setSelectedId(null);
    setForm(blank);
  }

  async function submit(event) {
    event.preventDefault();
    if (!isAdmin) return;
    if (selectedId) await http.put(`/products/${selectedId}`, { ...form, price: Number(form.price) });
    else await http.post("/products", { ...form, price: Number(form.price) });
    setMessage("Product saved successfully.");
    notifyCrmDataChanged("products");
    await load();
  }

  async function remove() {
    if (!isAdmin || !selectedId || !confirm("Delete this product?")) return;
    await http.delete(`/products/${selectedId}`);
    setMessage("Product deleted successfully.");
    notifyCrmDataChanged("products");
    reset();
    await load();
  }

  return (
    <div className="split-page">
      <section className="panel list-panel">
        <div className="panel-head">
          <h1>Products</h1>
          {isAdmin && <button className="btn btn-primary" onClick={reset}><Plus size={16} /> New</button>}
        </div>
        <div className="d-flex gap-2 mb-3">
          <input className="form-control" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-outline-primary" onClick={load}>Search</button>
        </div>
        {items.length === 0 ? <EmptyState title="No products" /> : (
          <div className="record-list">
            {items.map((item) => (
              <button key={item.id} className={`record-row ${selectedId === item.id ? "active" : ""}`} onClick={() => pick(item)}>
                <strong>{item.name}</strong>
                <span>{item.sku} | {item.category}</span>
                <small>{money.format(item.price)} | {item.status}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel detail-panel">
        <div className="panel-head">
          <h2>{selectedId ? "Product Details" : "Create Product"}</h2>
          {isAdmin && selectedId && <button className="btn btn-outline-danger" onClick={remove}><Trash2 size={16} /> Delete</button>}
        </div>
        {message && <div className="alert alert-success py-2">{message}</div>}
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-6"><label className="form-label">Name</label><input disabled={!isAdmin} className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">SKU</label><input disabled={!isAdmin} className="form-control" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Category</label><input disabled={!isAdmin} className="form-control" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Price</label><input disabled={!isAdmin} className="form-control" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Status</label><select disabled={!isAdmin} className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
          <div className="col-12"><label className="form-label">Description</label><textarea disabled={!isAdmin} className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          {isAdmin && <div className="col-12"><button className="btn btn-primary"><Save size={16} /> Save product</button></div>}
        </form>
      </section>
    </div>
  );
}
