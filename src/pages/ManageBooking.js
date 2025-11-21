import { useEffect, useState } from "react";
import "./ManageBooking.css";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminFetch } from "../utils/adminApi";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Completed", "Cancelled"];

function ManageBooking() {
  const { token } = useAdminAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  // Load bookings
  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await adminFetch("/api/admin/bookings", {}, token);
        if (!res.ok) {
          throw new Error("Failed to load bookings.");
        }

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const oldBookings = [...bookings];
    setUpdatingId(bookingId);

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status: newStatus } : b
      )
    );

    try {
      const res = await adminFetch(
        `/api/admin/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Failed to update booking status."
        );
      }

      const updated = await res.json();

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? updated : b))
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not update booking status. Please check if the API is running."
      );
      setBookings(oldBookings);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (bookingId) => {
    const target = bookings.find((b) => b._id === bookingId);
    if (!target) return;

    const ok = window.confirm(
      `Delete booking for ${target.customerName || "this customer"}?`
    );
    if (!ok) return;

    try {
      const res = await adminFetch(
        `/api/admin/bookings/${bookingId}`,
        { method: "DELETE" },
        token
      );

      if (!res.ok) {
        throw new Error("Failed to delete booking.");
      }

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not delete booking. Please check if the API is running."
      );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "All") return true;
    return (b.status || "Pending") === filterStatus;
  });

  const statusBadgeClass = (status) => {
    const s = (status || "Pending").toLowerCase();
    switch (s) {
      case "confirmed":
        return "booking-status booking-status-confirmed";
      case "completed":
        return "booking-status booking-status-completed";
      case "cancelled":
        return "booking-status booking-status-cancelled";
      default:
        return "booking-status booking-status-pending";
    }
  };

  return (
    <section className="booking-admin-page">
      <header className="booking-admin-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>
            View all bookings and update their status between Pending,
            Confirmed, Completed and Cancelled.
          </p>
        </div>

        <div className="booking-admin-filter">
          <label>
            Status filter:
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {error && <p className="booking-admin-error">{error}</p>}

      {loading ? (
        <p className="booking-admin-empty">Loading bookings…</p>
      ) : filteredBookings.length === 0 ? (
        <p className="booking-admin-empty">
          No bookings found for this filter.
        </p>
      ) : (
        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Customer</th>
                <th>Pickup</th>
                <th>Return</th>
                <th>Status</th>
                <th>Change status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const carName =
                  (b.car && `${b.car.brand || ""} ${b.car.model || ""}`.trim()) ||
                  (b.carBrand && `${b.carBrand} ${b.carModel || ""}`.trim()) ||
                  "—";

                return (
                  <tr key={b._id}>
                    <td>
                      <div className="booking-car-cell">
                        <div className="booking-car-name">{carName}</div>
                        {b.carPlate && (
                          <div className="booking-car-plate">
                            Plate: {b.carPlate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="booking-customer-cell">
                        <div className="booking-customer-name">
                          {b.customerName || "—"}
                        </div>
                        {b.customerPhone && (
                          <div className="booking-customer-phone">
                            {b.customerPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(b.pickupDate)}</td>
                    <td>{formatDate(b.returnDate)}</td>
                    <td>
                      <span className={statusBadgeClass(b.status)}>
                        {b.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="booking-status-select"
                        value={b.status || "Pending"}
                        disabled={updatingId === b._id}
                        onChange={(e) =>
                          handleStatusChange(b._id, e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="booking-delete-btn"
                        onClick={() => handleDelete(b._id)}
                      >
                        Delete
                      </button>
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

export default ManageBooking;
