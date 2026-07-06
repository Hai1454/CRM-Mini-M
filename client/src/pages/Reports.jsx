import { useCallback, useEffect, useMemo, useState } from "react";
import http from "../api/http";
import StatCard from "../components/StatCard.jsx";
import { CRM_DATA_CHANGED_EVENT, CRM_DATA_CHANGED_STORAGE_KEY } from "../utils/dataEvents.js";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadReports = useCallback(() => {
    return Promise.all([http.get("/dashboard"), http.get("/customers"), http.get("/orders")]).then(([dash, customerRes, orderRes]) => {
      setDashboard(dash.data);
      setCustomers(customerRes.data);
      setOrders(orderRes.data);
    });
  }, []);

  useEffect(() => {
    loadReports();

    const refresh = () => loadReports();
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
  }, [loadReports]);

  const customerByStatus = useMemo(() => {
    return customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {});
  }, [customers]);

  const ordersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  if (!dashboard) return <div className="loading-line">Loading reports...</div>;

  return (
    <div className="page-stack">
      <div className="page-title">
        <div>
          <h1>Reports</h1>
          <p>Revenue, order count, and customer status summaries.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Revenue" value={money.format(dashboard.stats.revenue)} hint="Completed orders" tone="orange" />
        <StatCard label="Orders" value={dashboard.stats.orders} hint="Total visible orders" tone="green" />
        <StatCard label="Customers" value={dashboard.stats.customers} hint="Customer profiles" tone="blue" />
        <StatCard label="Care notes" value={dashboard.stats.careItems} hint="Care history records" tone="red" />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-head"><h2>Customers by Status</h2></div>
          <div className="summary-list">
            {Object.entries(customerByStatus).map(([status, count]) => <div key={status}><span>{status}</span><strong>{count}</strong></div>)}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Orders by Status</h2></div>
          <div className="summary-list">
            {Object.entries(ordersByStatus).map(([status, count]) => <div key={status}><span>{status}</span><strong>{count}</strong></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
