import { useEffect, useMemo, useState } from "react";
import "./NewsletterManagement.css";
import { adminFetch } from "../utils/adminApi";
import { useAdminAuth } from "../context/AdminAuthContext";

function NewsletterManagement() {
  const { token } = useAdminAuth();

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // All | Active | Inactive

  // ---- Fetch subscribers ----
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await adminFetch(
        "/api/newsletter/admin/list",
        {},
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to load subscribers");
      }

      const data = await res.json();
      setSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---- Toggle active/inactive ----
  const toggleActive = async (id) => {
    try {
      setBusyId(id);
      setErrorMsg("");

      const res = await adminFetch(
        `/api/newsletter/admin/${id}/toggle`,
        { method: "PUT" },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to update subscriber");
      }

      const updated = await res.json();

      setSubs((prev) =>
        prev.map((s) => (s._id === id ? updated : s))
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not update subscriber");
    } finally {
      setBusyId(null);
    }
  };

  // ---- Delete subscriber ----
  const deleteSubscriber = async (id) => {
    const target = subs.find((s) => s._id === id);
    if (!target) return;

    const ok = window.confirm(`Delete ${target.email}?`);
    if (!ok) return;

    try {
      setBusyId(id);
      setErrorMsg("");

      const res = await adminFetch(
        `/api/newsletter/admin/${id}`,
        { method: "DELETE" },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Delete failed");
      }

      setSubs((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not delete subscriber");
    } finally {
      setBusyId(null);
    }
  };

  // ---- Derived UI data ----
  const stats = useMemo(() => {
    const total = subs.length;
    const active = subs.filter((s) => s.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [subs]);

  const filteredSubs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return subs.filter((s) => {
      const matchesSearch = !q || s.email.toLowerCase().includes(q);
      const matchesFilter =
        filter === "All" ||
        (filter === "Active" && s.isActive) ||
        (filter === "Inactive" && !s.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [subs, search, filter]);

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleString();
  };

  return (
    <section className="nm-page">
      <header className="nm-header">
        <div>
          <h1>Newsletter Subscribers</h1>
          <p>View, filter, deactivate or delete newsletter subscriptions.</p>
        </div>

        <button
          type="button"
          className="nm-refresh-btn"
          onClick={fetchSubscribers}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {/* Alerts */}
      {errorMsg && <p className="nm-error">{errorMsg}</p>}

      {/* Stats row */}
      <div className="nm-stats">
        <div className="nm-stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="nm-stat-card active">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="nm-stat-card inactive">
          <span>Inactive</span>
          <strong>{stats.inactive}</strong>
        </div>
      </div>

      {/* Controls */}
      <div className="nm-controls">
        <input
          type="text"
          placeholder="Search email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="nm-search"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="nm-filter"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p className="nm-loading">Loading subscribers…</p>
      ) : filteredSubs.length === 0 ? (
        <p className="nm-empty">No subscribers found.</p>
      ) : (
        <div className="nm-table-wrap">
          <table className="nm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Subscribed On</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((s) => {
                const isBusy = busyId === s._id;

                return (
                  <tr key={s._id}>
                    <td>
                      <div className="nm-email">
                        {s.email}
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          s.isActive
                            ? "nm-badge nm-badge-active"
                            : "nm-badge nm-badge-inactive"
                        }
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>{formatDate(s.createdAt)}</td>

                    <td style={{ textAlign: "right" }}>
                      <div className="nm-actions">
                        <button
                          className="nm-btn"
                          onClick={() => toggleActive(s._id)}
                          disabled={isBusy}
                        >
                          {isBusy
                            ? "Updating…"
                            : s.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          className="nm-btn danger"
                          onClick={() => deleteSubscriber(s._id)}
                          disabled={isBusy}
                        >
                          {isBusy ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default NewsletterManagement;
