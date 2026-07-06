import { KeyRound, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";
import { notifyCrmDataChanged } from "../utils/dataEvents.js";

const blank = {
  username: "",
  name: "",
  email: "",
  password: "123456",
  role: "STAFF",
  phone: "",
  title: "",
  status: "ACTIVE",
  managedCustomerIds: []
};

export default function StaffAccounts() {
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blank);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selected = useMemo(() => staff.find((item) => item.id === selectedId), [staff, selectedId]);

  async function load(nextSelectedId = selectedId) {
    const [staffRes, customerRes] = await Promise.all([http.get("/users"), http.get("/customers")]);
    setStaff(staffRes.data);
    setCustomers(customerRes.data);
    const next = staffRes.data.find((item) => item.id === nextSelectedId) || staffRes.data[0];
    if (next) pick(next, staffRes.data);
  }

  useEffect(() => { load(null); }, []);

  function pick(user, source = staff) {
    const record = source.find((item) => item.id === user.id) || user;
    setSelectedId(record.id);
    setForm({
      name: record.name || "",
      username: record.username || "",
      email: record.email || "",
      password: "",
      role: record.role || "STAFF",
      phone: record.phone || "",
      title: record.title || "",
      status: record.status || "ACTIVE",
      managedCustomerIds: record.managedCustomers?.map((item) => item.customerId) || []
    });
    setPassword("");
    setMessage("");
    setError("");
  }

  function reset() {
    setSelectedId(null);
    setForm(blank);
    setPassword("");
    setMessage("");
    setError("");
  }

  function toggleCustomer(id) {
    const exists = form.managedCustomerIds.includes(id);
    setForm({
      ...form,
      managedCustomerIds: exists
        ? form.managedCustomerIds.filter((item) => item !== id)
        : [...form.managedCustomerIds, id]
    });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      if (selectedId) {
        const payload = { ...form };
        delete payload.password;
        const { data } = await http.put(`/users/${selectedId}`, payload);
        setMessage(`Account saved. ${data.name} can manage ${data.managedCustomers?.length || 0} customer(s).`);
        notifyCrmDataChanged("staff");
        await load(selectedId);
      } else {
        const { data } = await http.post("/users", form);
        setMessage(`Account created. ${data.name} can manage ${data.managedCustomers?.length || 0} customer(s).`);
        notifyCrmDataChanged("staff");
        await load(data.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save account permissions.");
    }
  }

  async function changePassword() {
    if (!selectedId || password.length < 6) return;
    setMessage("");
    setError("");
    try {
      await http.patch(`/users/${selectedId}/password`, { password });
      setPassword("");
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update password.");
    }
  }

  async function remove() {
    if (!selectedId || !confirm("Delete this employee account?")) return;
    setMessage("");
    setError("");
    try {
      await http.delete(`/users/${selectedId}`);
      reset();
      setMessage("Account deleted successfully.");
      notifyCrmDataChanged("staff");
      await load(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete account.");
    }
  }

  return (
    <div className="split-page">
      <section className="panel list-panel">
        <div className="panel-head">
          <h1>Staff</h1>
          <button className="btn btn-primary" onClick={reset}><Plus size={16} /> New</button>
        </div>
        {staff.length === 0 ? <EmptyState title="No staff accounts" /> : (
          <div className="record-list">
            {staff.map((user) => (
              <button key={user.id} className={`record-row ${selectedId === user.id ? "active" : ""}`} onClick={() => pick(user)}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <small>{user.title || "Staff"} | {user.status}</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel detail-panel">
        <div className="panel-head">
          <h2>{selected ? "Staff Account Details" : "Create Staff Account"}</h2>
          {selected && <button className="btn btn-outline-danger" onClick={remove}><Trash2 size={16} /> Delete</button>}
        </div>
        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Username</label><input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          {!selectedId && <div className="col-md-6"><label className="form-label">Initial password</label><input className="form-control" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>}
          <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Job title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>STAFF</option><option>ADMIN</option></select></div>
          <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>SUSPENDED</option></select></div>
          <div className="col-12">
            <label className="form-label">Customer permissions</label>
            <p className="muted-text mb-2">{form.managedCustomerIds.length} customer(s) selected for this staff account.</p>
            <div className="check-grid">
              {customers.map((customer) => (
                <label key={customer.id} className="check-item">
                  <input type="checkbox" checked={form.managedCustomerIds.includes(customer.id)} onChange={() => toggleCustomer(customer.id)} />
                  <span>{customer.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-12"><button className="btn btn-primary"><Save size={16} /> Save account</button></div>
        </form>

        {selected && (
          <div className="password-box">
            <h3>Change password</h3>
            <div className="d-flex gap-2">
              <input className="form-control" minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
              <button className="btn btn-outline-primary" type="button" onClick={changePassword}><KeyRound size={16} /> Update</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
