import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";

const blank = { title: "", value: 0, stage: "New", customerId: "" };
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function Deals() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const [dealRes, customerRes] = await Promise.all([http.get("/deals"), http.get("/customers")]);
    setItems(dealRes.data);
    setCustomers(customerRes.data);
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, value: Number(form.value), customerId: Number(form.customerId) };
    if (editingId) await http.put(`/deals/${editingId}`, payload);
    else await http.post("/deals", payload);
    setForm(blank);
    setEditingId(null);
    await load();
  }

  function edit(deal) {
    setEditingId(deal.id);
    setForm({ title: deal.title, value: deal.value, stage: deal.stage, customerId: deal.customerId });
  }

  async function remove(id) {
    if (!confirm("Xoa co hoi nay?")) return;
    await http.delete(`/deals/${id}`);
    await load();
  }

  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Co hoi</h1><p>Theo doi gia tri va trang thai co hoi kinh doanh.</p></div></div>
      <section className="panel">
        <div className="panel-head"><h2>{editingId ? "Cap nhat co hoi" : "Them co hoi"}</h2></div>
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-4"><input required className="form-control" placeholder="Ten co hoi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="col-md-2"><input required className="form-control" type="number" placeholder="Gia tri" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <div className="col-md-3">
            <select required className="form-select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Chon khach hang</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              <option>New</option><option>Proposal</option><option>Negotiation</option><option>Won</option><option>Lost</option>
            </select>
          </div>
          <div className="col-md-1 d-grid"><button className="btn btn-primary" title="Luu"><Save size={16} /></button></div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-head"><h2>Danh sach co hoi</h2></div>
        {items.length === 0 ? <EmptyState /> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Ten</th><th>Khach hang</th><th>Gia tri</th><th>Trang thai</th><th></th></tr></thead>
              <tbody>
                {items.map((deal) => (
                  <tr key={deal.id}>
                    <td>{deal.title}</td><td>{deal.customer?.name}</td><td>{money.format(deal.value)}</td>
                    <td><span className="badge text-bg-light">{deal.stage}</span></td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => edit(deal)}>Sua</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(deal.id)} title="Xoa"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
