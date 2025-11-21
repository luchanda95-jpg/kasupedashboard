import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./AddCar.css";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminFetch } from "../utils/adminApi";

const defaultForm = {
  brand: "",
  model: "",
  year: "",
  pricePerDay: "",
  category: "",
  transmission: "",
  fuel_type: "",
  seating_capacity: "",
  location: "",
  description: "",
  isAvailable: true,
};

function AddCar() {
  const locationHook = useLocation();
  const editingCar = locationHook.state?.car || null;

  const { token } = useAdminAuth();

  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Pre-fill when editing
  useEffect(() => {
    if (editingCar) {
      setForm({
        brand: editingCar.brand || "",
        model: editingCar.model || "",
        year: editingCar.year || "",
        pricePerDay: editingCar.pricePerDay || "",
        category: editingCar.category || "",
        transmission: editingCar.transmission || "",
        fuel_type: editingCar.fuel_type || editingCar.fuelType || "",
        seating_capacity:
          editingCar.seating_capacity || editingCar.seatingCapacity || "",
        location: editingCar.location || "",
        description: editingCar.description || "",
        isAvailable: editingCar.isAvailable ?? true,
      });
      setImageFile(null); // keep existing image unless user uploads a new one
    }
  }, [editingCar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      setSubmitting(true);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, value);
        }
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const path = editingCar
        ? `/api/admin/cars/${editingCar._id}`
        : `/api/admin/cars`;

      const method = editingCar ? "PUT" : "POST";

      const res = await adminFetch(
        path,
        {
          method,
          body: formData, // browser sets boundary automatically
        },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Failed to save car details. Please try again."
        );
      }

      const saved = await res.json();
      console.log("Saved car:", saved);

      setStatus({
        type: "success",
        message: editingCar
          ? "Car details updated successfully."
          : "Car added successfully.",
      });

      if (!editingCar) {
        setForm(defaultForm);
        setImageFile(null);
        e.target.reset();
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message:
          err.message ||
          "Could not connect to the server. Check if the API is running.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const uploadLabel = imageFile ? imageFile.name : "Upload";

  return (
    <section className="addcar-page">
      <div className="addcar-header">
        <h1>{editingCar ? "Edit Car" : "Add New Car"}</h1>
        <p>
          Fill in details to list a car for booking, including pricing,
          availability, and specifications.
        </p>
      </div>

      {status.message && (
        <div
          className={`addcar-alert ${
            status.type === "success"
              ? "addcar-alert-success"
              : "addcar-alert-error"
          }`}
        >
          {status.message}
        </div>
      )}

      <form className="addcar-form" onSubmit={handleSubmit}>
        {/* Upload + label */}
        <div className="addcar-upload-row">
          <label htmlFor="carImage" className="addcar-upload-box">
            <span className="addcar-upload-icon">⬆</span>
            <span className="addcar-upload-text">{uploadLabel}</span>
            <span className="addcar-upload-sub">
              Upload a picture of your car
            </span>
            <input
              id="carImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>

        {/* 2-column grid */}
        <div className="addcar-grid">
          {/* Brand */}
          <div className="addcar-field">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              placeholder="e.g. BMW, Mercedes, Toyota..."
              value={form.brand}
              onChange={handleChange}
              required
            />
          </div>

          {/* Model */}
          <div className="addcar-field">
            <label>Model</label>
            <input
              type="text"
              name="model"
              placeholder="e.g. X5, Corolla, Fortuner..."
              value={form.model}
              onChange={handleChange}
              required
            />
          </div>

          {/* Year */}
          <div className="addcar-field">
            <label>Year</label>
            <input
              type="number"
              name="year"
              min="1990"
              max="2100"
              placeholder="YYYY"
              value={form.year}
              onChange={handleChange}
              required
            />
          </div>

          {/* Daily Price */}
          <div className="addcar-field">
            <label>Daily Price (K)</label>
            <input
              type="number"
              name="pricePerDay"
              min="0"
              step="1"
              placeholder="e.g. 550"
              value={form.pricePerDay}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div className="addcar-field">
            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Van">Van</option>
              <option value="Bus">Bus</option>
              <option value="Pickup">Pickup</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>

          {/* Transmission */}
          <div className="addcar-field">
            <label>Transmission</label>
            <select
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              required
            >
              <option value="">Select a transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div className="addcar-field">
            <label>Fuel Type</label>
            <select
              name="fuel_type"
              value={form.fuel_type}
              onChange={handleChange}
              required
            >
              <option value="">Select a fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          {/* Seating Capacity */}
          <div className="addcar-field">
            <label>Seating Capacity</label>
            <input
              type="number"
              name="seating_capacity"
              min="1"
              max="20"
              placeholder="e.g. 4, 7, 14"
              value={form.seating_capacity}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div className="addcar-field addcar-field-full">
            <label>Location</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            >
              <option value="">Select a location</option>
              <option value="Lusaka">Lusaka</option>
              <option value="Chipata">Chipata</option>
              <option value="Ndola">Ndola</option>
              <option value="Kitwe">Kitwe</option>
              <option value="Livingstone">Livingstone</option>
              <option value="Kasama">Kasama</option>
            </select>
          </div>

          {/* Availability toggle */}
          <div className="addcar-field addcar-field-full addcar-toggle-row">
            <label>Availability</label>
            <label className="addcar-switch">
              <input
                type="checkbox"
                name="isAvailable"
                checked={form.isAvailable}
                onChange={handleChange}
              />
              <span className="addcar-slider" />
            </label>
            <span className="addcar-toggle-text">
              {form.isAvailable
                ? "Car is available for booking"
                : "Mark as unavailable"}
            </span>
          </div>

          {/* Description – full width */}
          <div className="addcar-field addcar-field-full">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="e.g. A luxurious SUV with a spacious interior and a powerful engine."
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="addcar-actions">
          <button
            type="submit"
            className="addcar-submit"
            disabled={submitting}
          >
            {submitting
              ? editingCar
                ? "Saving changes..."
                : "Adding car..."
              : editingCar
              ? "Save changes"
              : "Add car"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddCar;
