import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area">
        <Topbar />
        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
