import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CarManagement.css";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminFetch } from "../utils/adminApi";

const placeholderImg =
  "https://via.placeholder.com/120x80?text=Kasupe+Car";

function CarManagement() {
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // -------- Load cars --------
  const fetchCars = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await adminFetch("/api/admin/cars", {}, token);

      if (!res.ok) {
        throw new Error("Failed to load cars.");
      }

      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message || "Could not load cars. Please check if the API is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // -------- Handlers --------

  const handleEdit = (car) => {
    navigate("/admin/add-car", { state: { car } });
  };

  const handleToggleAvailable = async (car) => {
    const newValue = !car.isAvailable;

    try {
      setUpdatingId(car._id);
      setErrorMsg("");

      const res = await adminFetch(
        `/api/admin/cars/${car._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: newValue }),
        },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Failed to update car availability."
        );
      }

      const updated = await res.json();

      setCars((prev) =>
        prev.map((c) => (c._id === car._id ? updated : c))
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Could not update this car. Please check if the API is running."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (car) => {
    const confirmDelete = window.confirm(
      `Delete "${car.brand} ${car.model}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(car._id);
      setErrorMsg("");

      const res = await adminFetch(
        `/api/admin/cars/${car._id}`,
        { method: "DELETE" },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Failed to delete car via API."
        );
      }

      setCars((prev) => prev.filter((c) => c._id !== car._id));
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Could not delete this car. Please check if the API is running."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // -------- Render --------

  return (
    <section className="car-admin-page">
      <header className="car-admin-header">
        <div>
          <h1>Manage cars</h1>
          <p>View, edit and control availability of all listed vehicles.</p>
        </div>

        <button
          type="button"
          className="car-admin-add-btn"
          onClick={() => navigate("/admin/add-car")}
        >
          + Add car
        </button>
      </header>

      {errorMsg && <p className="car-admin-error">{errorMsg}</p>}

      {loading ? (
        <p className="car-admin-loading">Loading cars…</p>
      ) : cars.length === 0 ? (
        <p className="car-admin-empty">
          No cars found. Use “Add car” to create your first listing.
        </p>
      ) : (
        <div className="car-admin-table-wrap">
          <table className="car-admin-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Category</th>
                <th>Location</th>
                <th>Daily price (K)</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const img = car.image || placeholderImg;
                const isBusy = updatingId === car._id || deletingId === car._id;

                return (
                  <tr key={car._id}>
                    <td>
                      <div className="car-admin-main">
                        <div className="car-admin-thumb">
                          <img
                            src={img}
                            alt={`${car.brand} ${car.model}`}
                          />
                        </div>
                        <div className="car-admin-main-text">
                          <div className="car-admin-name">
                            {car.brand} {car.model}
                          </div>
                          <div className="car-admin-meta">
                            {car.year} • {car.seating_capacity} seats
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{car.category}</td>
                    <td>{car.location}</td>
                    <td>{car.pricePerDay}</td>

                    <td>
                      <button
                        type="button"
                        className={
                          car.isAvailable
                            ? "car-admin-status car-admin-status-available"
                            : "car-admin-status car-admin-status-unavailable"
                        }
                        disabled={updatingId === car._id}
                        onClick={() => handleToggleAvailable(car)}
                      >
                        {updatingId === car._id
                          ? "Updating..."
                          : car.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="car-admin-actions">
                        <button
                          type="button"
                          className="car-admin-btn"
                          onClick={() => handleEdit(car)}
                          disabled={isBusy}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="car-admin-btn danger"
                          onClick={() => handleDelete(car)}
                          disabled={isBusy}
                        >
                          {deletingId === car._id ? "Deleting…" : "Delete"}
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

export default CarManagement;
