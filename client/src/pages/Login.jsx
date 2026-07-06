import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const [form, setForm] = useState({ email: "admin@crm.local", password: "123456" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-icon">
          <LockKeyhole size={26} />
        </div>
        <h1>CRM Mini</h1>
        <p>Sign in to manage staff accounts and customer ownership.</p>
        <form onSubmit={handleSubmit} className="vstack gap-3">
          <input
            className="form-control"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
          />
          <input
            className="form-control"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Password"
          />
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
