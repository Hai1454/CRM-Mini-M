import { LogOut, Search } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={18} />
        <span>CRM workspace for customers, orders, care history, reports, and permissions</span>
      </div>
      <div className="user-box">
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>
        <button className="icon-button" type="button" onClick={logout} title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
