import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { notifyCrmDataChanged } from "../utils/dataEvents.js";

const blank = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  customerType: "Potential",
  source: "Website",
  status: "Lead",
  note: "",
  managerIds: []
};

export default function Customers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const selected = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId]);
  const isAdmin = user?.role === "ADMIN";

  async function load(nextSelectedId = selectedId) {
    const customerRequest = http.get("/customers", { params: { q: query } });
    const staffRequest = isAdmin ? http.get("/users") : Promise.resolve({ data: [] });
    const [customerRes, staffRes] = await Promise.all([customerRequest, staffRequest]);
    setItems(customerRes.data);
    setStaff(staffRes.data);
    const next = customerRes.data.find((item) => item.id === nextSelectedId) || customerRes.data[0];
    if (next) pick(next, customerRes.data);
  }

  useEffect(() => { load(null); }, []);

  function pick(customer, source = items) {
    const record = source.find((item) => item.id === customer.id) || customer;
    setSelectedId(record.id);
    setForm({
      name: record.name || "",
      company: record.company || "",
      email: record.email || "",
      phone: record.phone || "",
      address: record.address || "",
      customerType: record.customerType || "Potential",
      source: record.source || "Website",
      status: record.status || "Lead",
      note: record.note || "",
      managerIds: record.managerIds || []
    });
  }

  function reset() {
    setSelectedId(null);
    setForm(blank);
  }

  function toggleManager(id) {
    const exists = form.managerIds.includes(id);
    setForm({
      ...form,
      managerIds: exists ? form.managerIds.filter((item) => item !== id) : [...form.managerIds, id]
    });
  }

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, managerIds: [...new Set(form.managerIds)] };
    if (selectedId) {
      await http.put(`/customers/${selectedId}`, payload);
      setMessage("Customer saved successfully.");
      notifyCrmDataChanged("customers");
      await load(selectedId);
    } else {
      const { data } = await http.post("/customers", payload);
      setMessage("Customer created successfully.");
      notifyCrmDataChanged("customers");
      await load(data.id);
    }
  }

  async function remove() {
    if (!selectedId || !confirm("Delete this customer?")) return;
    await http.delete(`/customers/${selectedId}`);
    setMessage("Customer deleted successfully.");
    notifyCrmDataChanged("customers");
    reset();
    await load(null);
  }

  return (
    <div className="split-page">
      <section className="panel list-panel">
        <div className="panel-head">
          <h1>Customers</h1>
          <button className="btn btn-primary" onClick={reset}><Plus size={16} /> New</button>
        </div>
        <div className="d-flex gap-2 mb-3">
          <input className="form-control" placeholder="Search customers" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-outline-primary" onClick={() => load(selectedId)}>Search</button>
        </div>

        {items.length === 0 ? <EmptyState title="No customers" /> : (
          <div className="record-list">
            {items.map((customer) => (
              <button key={customer.id} className={`record-row ${selectedId === customer.id ? "active" : ""}`} onClick={() => pick(customer)}>
                <strong>{customer.name}</strong>
                <span>{customer.company}</span>
                <small>{customer.managers?.length ? customer.managers.map((manager) => manager.name).join(", ") : "No manager assigned"}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel detail-panel">
        <div className="panel-head">
          <h2>{selected ? "Customer Details" : "Create Customer"}</h2>
          {selected && isAdmin && <button className="btn btn-outline-danger" onClick={remove}><Trash2 size={16} /> Delete</button>}
        </div>
        {message && <div className="alert alert-success py-2">{message}</div>}
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Company</label><input className="form-control" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="col-md-6">
            <label className="form-label">Customer type</label>
            <select className="form-select" value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })}>
              <option>Potential</option><option>Consulting</option><option>Purchased</option><option>Stopped</option>
            </select>
          </div>
          <div className="col-md-6"><label className="form-label">Source</label><input className="form-control" required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Lead</option><option>Prospect</option><option>Customer</option><option>Completed</option><option>Inactive</option>
            </select>
          </div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="3" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>

          {isAdmin && (
            <div className="col-12">
              <label className="form-label">Staff allowed to manage this customer</label>
              <div className="check-grid">
                {staff.map((employee) => (
                  <label key={employee.id} className="check-item">
                    <input type="checkbox" checked={form.managerIds.includes(employee.id)} onChange={() => toggleManager(employee.id)} />
                    <span>{employee.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {!isAdmin && selected && (
            <div className="col-12">
              <label className="form-label">Assigned staff</label>
              <div className="pill-row">
                {selected.managers?.map((manager) => <span key={manager.id} className="pill">{manager.name}</span>)}
              </div>
            </div>
          )}

          <div className="col-12"><button className="btn btn-primary"><Save size={16} /> Save customer</button></div>
        </form>
      </section>
    </div>
  );
}
