import { useCallback, useEffect, useState } from "react";
import http from "../api/http";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import { CRM_DATA_CHANGED_EVENT, CRM_DATA_CHANGED_STORAGE_KEY } from "../utils/dataEvents.js";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const { data: nextData } = await http.get("/dashboard");
      setData(nextData);
    } finally {
      if (silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const refresh = () => loadDashboard(true);
    const refreshFromStorage = (event) => {
      if (event.key === CRM_DATA_CHANGED_STORAGE_KEY) refresh();
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener(CRM_DATA_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refreshFromStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener(CRM_DATA_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refreshFromStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadDashboard]);

  if (!data) return <div className="loading-line">Loading dashboard...</div>;

  const isAdmin = data.role === "ADMIN";

  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>{isAdmin ? "Admin Dashboard" : "Personal Dashboard"}</h1>
          <p>{isAdmin ? "System-wide CRM overview." : "Your assigned customers, orders, and care activities."}</p>
        </div>
        {refreshing && <span className="muted-text">Updating...</span>}
      </div>

      <div className="stat-grid">
        <StatCard label="Customers" value={data.stats.customers} hint={isAdmin ? "Total CRM profiles" : "Assigned to you"} tone="blue" />
        <StatCard label="Orders" value={data.stats.orders} hint="Tracked orders" tone="green" />
        <StatCard label="Revenue" value={money.format(data.stats.revenue)} hint="Completed orders" tone="orange" />
        <StatCard label="Care notes" value={data.stats.careItems} hint="Consultations, calls, meetings" tone="red" />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-head">
            <h2>New Customers</h2>
          </div>
          {data.recentCustomers.length === 0 ? <EmptyState /> : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recentCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td>{customer.company}</td>
                      <td><span className="badge text-bg-light">{customer.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Recent Orders</h2>
          </div>
          {data.recentOrders.length === 0 ? <EmptyState /> : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Code</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.code}</td>
                      <td>{order.customer?.name}</td>
                      <td>{money.format(order.total)}</td>
                      <td><span className="badge text-bg-light">{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
