import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";

const blank = { subject: "", priority: "Medium", status: "Open", description: "", customerId: "" };

export default function Tickets() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const [ticketRes, customerRes] = await Promise.all([http.get("/tickets"), http.get("/customers")]);
    setItems(ticketRes.data);
    setCustomers(customerRes.data);
  }

  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, customerId: Number(form.customerId) };
    if (editingId) await http.put(`/tickets/${editingId}`, payload);
    else await http.post("/tickets", payload);
    setForm(blank);
    setEditingId(null);
    await load();
  }

  function edit(ticket) {
    setEditingId(ticket.id);
    setForm({
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      description: ticket.description || "",
      customerId: ticket.customerId
    });
  }

  async function remove(id) {
    if (!confirm("Xoa ticket nay?")) return;
    await http.delete(`/tickets/${id}`);
    await load();
  }

  return (
    <div className="page-stack">
      <div className="page-title"><div><h1>Ticket ho tro</h1><p>Ghi nhan va theo doi yeu cau ky thuat cua khach hang.</p></div></div>
      <section className="panel">
        <div className="panel-head"><h2>{editingId ? "Cap nhat ticket" : "Them ticket"}</h2></div>
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-4"><input required className="form-control" placeholder="Noi dung yeu cau" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="col-md-3">
            <select required className="form-select" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">Chon khach hang</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Open</option><option>In Progress</option><option>Closed</option>
            </select>
          </div>
          <div className="col-md-1 d-grid"><button className="btn btn-primary" title="Luu"><Save size={16} /></button></div>
          <div className="col-12"><input className="form-control" placeholder="Mo ta them" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-head"><h2>Danh sach ticket</h2></div>
        {items.length === 0 ? <EmptyState /> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Yeu cau</th><th>Khach hang</th><th>Uu tien</th><th>Trang thai</th><th></th></tr></thead>
              <tbody>
                {items.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.subject}</td><td>{ticket.customer?.name}</td>
                    <td><span className={`badge priority-${ticket.priority.toLowerCase().replace(" ", "-")}`}>{ticket.priority}</span></td>
                    <td><span className="badge text-bg-light">{ticket.status}</span></td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => edit(ticket)}>Sua</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(ticket.id)} title="Xoa"><Trash2 size={15} /></button>
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
