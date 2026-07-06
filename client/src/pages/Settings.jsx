import { KeyRound, Save } from "lucide-react";
import { useEffect, useState } from "react";
import http from "../api/http";
import { useAuth } from "../state/AuthContext.jsx";

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ username: "", name: "", email: "", phone: "", title: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile({
      username: user?.username || "",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      title: user?.title || ""
    });
  }, [user]);

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    const { data } = await http.put("/auth/profile", profile);
    localStorage.setItem("crm_user", JSON.stringify(data.user));
    setMessage("Profile updated successfully. Refreshing the app will show the latest navbar details.");
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    try {
      await http.patch("/auth/password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update password.");
    }
  }

  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>{user?.role === "ADMIN" ? "Settings" : "Personal Profile"}</h1>
          <p>Update account information and change your password.</p>
        </div>
      </div>

      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <section className="panel">
        <div className="panel-head"><h2>Profile information</h2></div>
        <form className="row g-3" onSubmit={saveProfile}>
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Username</label><input className="form-control" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Job title</label><input className="form-control" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">Role</label><input className="form-control" disabled value={user?.role || ""} /></div>
          <div className="col-12"><button className="btn btn-primary"><Save size={16} /> Save profile</button></div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Change password</h2></div>
        <form className="row g-3" onSubmit={changePassword}>
          <div className="col-md-6"><label className="form-label">Current password</label><input className="form-control" type="password" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></div>
          <div className="col-md-6"><label className="form-label">New password</label><input className="form-control" type="password" minLength="6" required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></div>
          <div className="col-12"><button className="btn btn-outline-primary"><KeyRound size={16} /> Update password</button></div>
        </form>
      </section>
    </div>
  );
}
