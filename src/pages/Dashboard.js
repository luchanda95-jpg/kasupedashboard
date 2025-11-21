// src/pages/Dashboard.js
import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { dummyDashboardData } from "../assets/assets";
import { adminFetch } from "../utils/adminApi";
import { useAdminAuth } from "../context/AdminAuthContext";

import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const PIE_COLORS = ["#facc15", "#ef4444", "#111827", "#9ca3af"];

function Dashboard() {
  const { token, user } = useAdminAuth();

  const [stats, setStats] = useState(dummyDashboardData);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("demo");
  const [errorMsg, setErrorMsg] = useState("");
  const [tab, setTab] = useState("daily");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await adminFetch("/api/admin/overview", {}, token);
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "Failed to load dashboard data.");
        }

        const data = await res.json();
        setStats({ ...dummyDashboardData, ...data });
        setApiStatus("live");
      } catch (err) {
        console.error(err);
        setApiStatus("error");
        setErrorMsg("Could not load admin dashboard data. Using demo numbers.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [token]);

  const {
    totalCars = 0,
    totalBookings = 0,
    pendingBookings = 0,
    completedBookings = 0,
    cancelledBookings = 0,
    monthlyRevenue = 0,

    activeBookings = 0,
    utilizationRate = 0,
    avgBookingLength = 0,
    cancellationRate = 0,
    topCars = [],
    paymentSplit = { mtn: 0, airtel: 0, card: 0, unknown: 0 },

    dailySeries = [],
    weeklySeries = [],
    monthlySeries = [],
    yearlySeries = [],

    recentBookings = [],
  } = stats || {};

  const seriesMap = useMemo(() => ({
    daily: dailySeries,
    weekly: weeklySeries,
    monthly: monthlySeries,
    yearly: yearlySeries,
  }), [dailySeries, weeklySeries, monthlySeries, yearlySeries]);

  const activeSeries = seriesMap[tab] || [];

  const paymentData = [
    { name: "MTN", value: paymentSplit.mtn },
    { name: "Airtel", value: paymentSplit.airtel },
    { name: "Card", value: paymentSplit.card },
    { name: "Unknown", value: paymentSplit.unknown },
  ].filter((x) => x.value > 0 || x.name === "Unknown");

  return (
    <section className="dash-page">
      {/* Header */}
      <div className="dash-header-row">
        <div>
          <h1 className="dash-title">Kasupe Admin Dashboard</h1>
          <p className="dash-subtitle">
            Overview of cars, bookings, revenue and performance trends.
          </p>
        </div>

        <div className="dash-header-right">
          <span className={`dash-badge dash-badge-${apiStatus}`}>
            {apiStatus === "live"
              ? "API live"
              : apiStatus === "error"
              ? "API offline (demo data)"
              : "Demo data"}
          </span>

          <div className="dash-user-chip">
            <div className="dash-user-avatar">
              {(user?.name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="dash-user-meta">
              <span className="dash-user-name">{user?.name || "Admin user"}</span>
              <span className="dash-user-role">{user?.role || "Admin"}</span>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && <p className="dash-error-msg">{errorMsg}</p>}

      {/* Main stat cards */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <span className="dash-stat-label">Total cars</span>
          <span className="dash-stat-value">{totalCars}</span>
          <span className="dash-stat-foot">Fleet size</span>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Total bookings</span>
          <span className="dash-stat-value">{totalBookings}</span>
          <span className="dash-stat-foot">All time</span>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Pending bookings</span>
          <span className="dash-stat-value pending">{pendingBookings}</span>
          <span className="dash-stat-foot">Awaiting approval</span>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Completed trips</span>
          <span className="dash-stat-value success">{completedBookings}</span>
          <span className="dash-stat-foot">Successfully closed</span>
        </div>

        <div className="dash-stat-card">
          <span className="dash-stat-label">Cancelled bookings</span>
          <span className="dash-stat-value danger">{cancelledBookings}</span>
          <span className="dash-stat-foot">All time</span>
        </div>

        <div className="dash-stat-card dash-stat-wide">
          <span className="dash-stat-label">Revenue this period (K)</span>
          <span className="dash-stat-value">{monthlyRevenue}</span>
          <span className="dash-stat-foot">Based on {tab} rentals</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <h3>Fleet utilization</h3>
          <p className="dash-kpi-value">{utilizationRate.toFixed(1)}%</p>
          <p className="dash-kpi-sub">
            {activeBookings} cars currently booked
          </p>
          <div className="dash-progress">
            <div
              className="dash-progress-bar"
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="dash-kpi-card">
          <h3>Average booking length</h3>
          <p className="dash-kpi-value">{avgBookingLength.toFixed(1)} days</p>
          <p className="dash-kpi-sub">Across all trips</p>
        </div>

        <div className="dash-kpi-card">
          <h3>Cancellation rate</h3>
          <p className="dash-kpi-value">{cancellationRate.toFixed(1)}%</p>
          <p className="dash-kpi-sub">Cancelled vs total bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`dash-tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Performance charts */}
      <div className="dash-charts-grid">
        {/* Revenue trend */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Revenue trend ({tab})</h2>
            {loading && <span className="dash-tag">Refreshing…</span>}
          </div>

          {activeSeries.length === 0 ? (
            <p className="dash-empty">No revenue data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={activeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue (K)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bookings volume */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Bookings volume ({tab})</h2>
          </div>

          {activeSeries.length === 0 ? (
            <p className="dash-empty">No bookings data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={activeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top cars + payment split */}
      <div className="dash-charts-grid">
        {/* Top cars */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Top 5 most booked cars</h2>
          </div>

          {topCars.length === 0 ? (
            <p className="dash-empty">No car booking stats yet.</p>
          ) : (
            <>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={topCars}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={(c) => `${c.brand} ${c.model}`} hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" name="Bookings" />
                    <Bar dataKey="revenue" name="Revenue (K)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="dash-topcars-list">
                {topCars.map((c) => (
                  <div key={c.carId} className="dash-topcar-item">
                    <img
                      src={c.image || "https://via.placeholder.com/90x60?text=Car"}
                      alt={`${c.brand} ${c.model}`}
                    />
                    <div>
                      <div className="dash-topcar-name">{c.brand} {c.model}</div>
                      <div className="dash-topcar-meta">
                        {c.bookings} bookings • K{c.revenue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Payment split */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Payment split</h2>
          </div>

          {paymentData.length === 0 ? (
            <p className="dash-empty">No payment data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="dash-bottom-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent bookings</h2>
          </div>

          {recentBookings.length === 0 ? (
            <p className="dash-empty">No recent bookings to show.</p>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Customer</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Total (K)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => {
                    const car = booking.car || {};
                    const pickup = booking.pickupDate ? new Date(booking.pickupDate) : null;
                    const ret = booking.returnDate ? new Date(booking.returnDate) : null;
                    const dateRange =
                      pickup && ret
                        ? `${pickup.toLocaleDateString()} → ${ret.toLocaleDateString()}`
                        : "N/A";

                    return (
                      <tr key={booking._id}>
                        <td>
                          <div className="dash-car-cell">
                            <span className="dash-car-name">
                              {car.brand} {car.model}
                            </span>
                            <span className="dash-car-sub">
                              {car.location || "No location"}
                            </span>
                          </div>
                        </td>
                        <td>{booking.customerName || "Customer"}</td>
                        <td>{dateRange}</td>
                        <td>
                          <span className={"dash-status-badge dash-status-" + (booking.status || "pending").toLowerCase()}>
                            {booking.status || "Pending"}
                          </span>
                        </td>
                        <td>{booking.totalPrice ?? booking.price ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Quick insights</h2>
          </div>
          <ul className="dash-insights-list">
            <li>Confirm pending bookings quickly to reduce cancellations.</li>
            <li>Monitor top cars and keep them available on weekends.</li>
            <li>Watch utilization — if too high, expand fleet or pricing.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
