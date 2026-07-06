import { Mail, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../api/http";

export default function Account() {
  const [data, setData] = useState(null);

  useEffect(() => {
    http.get("/users/me").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="loading-line">Loading account...</div>;

  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>Admin Account</h1>
          <p>Current account details and access summary.</p>
        </div>
      </div>

      <section className="profile-panel">
        <div className="profile-avatar">{data.user.name?.charAt(0) || "A"}</div>
        <div className="profile-main">
          <span className="eyebrow">{data.user.role}</span>
          <h2>{data.user.name}</h2>
          <p>{data.user.title || "No title set"}</p>
          <div className="profile-meta">
            <span><Mail size={16} /> {data.user.email}</span>
            <span><Phone size={16} /> {data.user.phone || "No phone"}</span>
            <span><ShieldCheck size={16} /> {data.user.status}</span>
          </div>
        </div>
      </section>

      <div className="stat-grid two">
        <section className="stat-card tone-blue">
          <span>Managed customers</span>
          <strong>{data.stats.managedCustomers}</strong>
          <small>Customers visible to this account</small>
        </section>
        <section className="stat-card tone-green">
          <span>Staff accounts</span>
          <strong>{data.stats.staffAccounts}</strong>
          <small>Employee accounts in the system</small>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Language and data input</h2>
        </div>
        <p className="muted-text">
          The interface is in English. Names, notes, company data, and customer details can still be entered in Vietnamese
          with accents because the backend stores them as Unicode text.
        </p>
      </section>
    </div>
  );
}
