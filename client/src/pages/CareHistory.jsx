import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { notifyCrmDataChanged } from "../utils/dataEvents.js";

const blank = { customerId: "", staffId: "", type: "Call", summary: "", result: "", nextAction: "", careDate: "", nextSchedule: "" };

export default function CareHistory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const isAdmin = user?.role === "ADMIN";

  async function load() {
    const [careRes, customerRes, staffRes] = await Promise.all([
      http.get("/care-history", { params: { q: query } }),
      http.get("/customers"),
      isAdmin ? http.get("/users") : Promise.resolve({ data: [] })
    ]);
    setItems(careRes.data);
    setCustomers(customerRes.data);
    setStaff(staffRes.data);
    if (!selectedId && careRes.data[0]) pick(careRes.data[0]);
  }

  useEffect(() => { load(); }, []);

  function dateValue(value) {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
  }

  function pick(item) {
    setSelectedId(item.id);
    setForm({
      customerId: item.customerId,
      staffId: item.staffId || "",
      type: item.type,
      summary: item.summary,
      result: item.result || "",
      nextAction: item.nextAction || "",
      careDate: dateValue(item.careDate),
      nextSchedule: dateValue(item.nextSchedule)
    });
  }

  function reset() {
    setSelectedId(null);
    setForm({ ...blank, careDate: new Date().toISOString().slice(0, 10) });
  }

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, customerId: Number(form.customerId), staffId: form.staffId ? Number(form.staffId) : null };
    if (selectedId) await http.put(`/care-history/${selectedId}`, payload);
    else await http.post("/care-history", payload);
    setMessage("Care history saved successfully.");
    notifyCrmDataChanged("care-history");
    await load();
  }

  async function remove() {
    if (!isAdmin || !selectedId || !confirm("Delete this care history item?")) return;
    await http.delete(`/care-history/${selectedId}`);
    setMessage("Care history deleted successfully.");
    notifyCrmDataChanged("care-history");
    reset();
    await load();
  }

  return (
    <div className="split-page">
      <section className="panel list-panel">
        <div className="panel-head">
          <h1>Care History</h1>
          <button className="btn btn-primary" onClick={reset}><Plus size={16} /> New</button>
        </div>
        <div className="d-flex gap-2 mb-3">
          <input className="form-control" placeholder="Search care notes" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn btn-outline-primary" onClick={load}>Search</button>
        </div>
        {items.length === 0 ? <EmptyState title="No care history" /> : (
          <div className="record-list">
            {items.map((item) => (
              <button key={item.id} className={`record-row ${selectedId === item.id ? "active" : ""}`} onClick={() => pick(item)}>
                <strong>{item.customer?.name}</strong>
                <span>{item.type} | {item.staff?.name || "Unassigned"}</span>
                <small>{item.summary}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel detail-panel">
        <div className="panel-head">
          <h2>{selectedId ? "Care Note Details" : "Create Care Note"}</h2>
          {isAdmin && selectedId && <button className="btn btn-outline-danger" onClick={remove}><Trash2 size={16} /> Delete</button>}
        </div>
        {message && <div className="alert alert-success py-2">{message}</div>}
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-6"><label className="form-label">Customer</label><select className="form-select" required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select customer</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          {isAdmin && <div className="col-md-6"><label className="form-label">Responsible staff</label><select className="form-select" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}><option value="">Unassigned</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>}
          <div className="col-md-4"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Call</option><option>Email</option><option>Meeting</option><option>Consultation</option></select></div>
          <div className="col-md-4"><label className="form-label">Care date</label><input className="form-control" type="date" value={form.careDate} onChange={(e) => setForm({ ...form, careDate: e.target.value })} /></div>
          <div className="col-12"><label className="form-label">Summary</label><textarea className="form-control" required rows="3" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="col-12"><label className="form-label">Result</label><textarea className="form-control" rows="2" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} /></div>
          <div className="col-12"><label className="form-label">Next action</label><input className="form-control" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">Next schedule</label><input className="form-control" type="date" value={form.nextSchedule} onChange={(e) => setForm({ ...form, nextSchedule: e.target.value })} /></div>
          <div className="col-12"><button className="btn btn-primary"><Save size={16} /> Save care note</button></div>
        </form>
      </section>
    </div>
  );
}
