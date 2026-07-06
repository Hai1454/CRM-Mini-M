import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileBarChart,
  HeartHandshake,
  LogOut,
  Settings,
  UserCog,
  UserRound,
  UsersRound
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const adminItems = [
    { to: "/", icon: BarChart3, label: "Dashboard" },
    { to: "/customers", icon: UsersRound, label: "Customers" },
    { to: "/orders", icon: ClipboardList, label: "Orders" },
    { to: "/products", icon: Boxes, label: "Products" },
    { to: "/care-history", icon: HeartHandshake, label: "Care History" },
    { to: "/staff", icon: UserCog, label: "Staff" },
    { to: "/reports", icon: FileBarChart, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];
  const staffItems = [
    { to: "/", icon: BarChart3, label: "Dashboard" },
    { to: "/customers", icon: UsersRound, label: "Customers" },
    { to: "/orders", icon: ClipboardList, label: "Orders" },
    { to: "/care-history", icon: HeartHandshake, label: "Care History" },
    { to: "/profile", icon: UserRound, label: "Profile" }
  ];
  const items = user?.role === "ADMIN" ? adminItems : staffItems;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">C</div>
        <div>
          <strong>CRM Mini</strong>
          <span>{user?.role === "ADMIN" ? "Admin workspace" : "Staff workspace"}</span>
        </div>
      </div>
      <nav className="nav-list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link">
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button className="nav-link nav-button" type="button" onClick={logout}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </nav>
    </aside>
  );
}
