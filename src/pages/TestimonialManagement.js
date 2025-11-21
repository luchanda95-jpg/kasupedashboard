// src/pages/TestimonialManagement.js
import { useCallback, useEffect, useState } from "react";
import "./TestimonialManagement.css";
import { adminFetch } from "../utils/adminApi";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_BASE = "http://localhost:5000";

const emptyForm = {
  name: "",
  role: "",
  trip: "",
  text: "",
  rating: 5,
  image: "",      // optional URL OR existing server path
  isActive: true,
};

function TestimonialManagement() {
  const { token } = useAdminAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Build correct image URL for display
  const getImageSrc = (img) => {
    if (!img) return "https://via.placeholder.com/60";
    if (img.startsWith("http")) return img;
    // if stored like "/uploads/abc.jpg"
    return `${API_BASE}${img}`;
  };

  // -------- Fetch testimonials (admin list) --------
  const fetchTestimonials = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await adminFetch(
        "/api/admin/testimonials/admin/list",
        {},
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to load testimonials");
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not load testimonials");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // -------- Form handlers --------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "rating"
          ? Number(value)
          : value,
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setImageFile(null);

    setForm({
      name: t.name || "",
      role: t.role || "",
      trip: t.trip || "",
      text: t.text || "",
      rating: t.rating || 5,
      image: t.image || "", // keep old image path
      isActive: t.isActive ?? true,
    });
  };

  // -------- Save (create/update) --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const isEdit = Boolean(editingId);

      const formData = new FormData();

      // ✅ Append everything EXCEPT image first
      Object.entries(form).forEach(([k, v]) => {
        if (k === "image") return; // handle image separately
        if (typeof v === "boolean") formData.append(k, v ? "true" : "false");
        else formData.append(k, v);
      });

      /**
       * ✅ Only send image IF:
       * 1) user selected a new file, OR
       * 2) user provided a non-empty URL
       *
       * If neither → do NOT send "image" field,
       * so backend keeps old image.
       */
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (form.image && form.image.trim() !== "") {
        formData.append("image", form.image.trim());
      }

      const url = isEdit
        ? `/api/admin/testimonials/admin/${editingId}`
        : `/api/admin/testimonials/admin`;

      const method = isEdit ? "PUT" : "POST";

      const res = await adminFetch(url, { method, body: formData }, token);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Save failed");
      }

      const saved = await res.json();

      setItems((prev) => {
        if (isEdit) {
          return prev.map((x) => (x._id === editingId ? saved : x));
        }
        return [saved, ...prev];
      });

      resetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not save testimonial");
    } finally {
      setSaving(false);
    }
  };

  // -------- Delete --------
  const handleDelete = async (id) => {
    const t = items.find((x) => x._id === id);
    if (!t) return;

    if (!window.confirm(`Delete testimonial by ${t.name}?`)) return;

    try {
      const res = await adminFetch(
        `/api/admin/testimonials/admin/${id}`,
        { method: "DELETE" },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Delete failed");
      }

      setItems((prev) => prev.filter((x) => x._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not delete testimonial");
    }
  };

  const uploadLabel = imageFile ? imageFile.name : "Upload image";

  // -------- Render --------
  return (
    <section className="tm-page">
      <header className="tm-header">
        <div>
          <h1>Testimonials</h1>
          <p>Add, edit and hide testimonials shown on the public website.</p>
        </div>
      </header>

      {errorMsg && <p className="tm-error">{errorMsg}</p>}

      <div className="tm-grid">
        {/* FORM */}
        <div className="tm-card">
          <div className="tm-card-header">
            <h2>{editingId ? "Edit testimonial" : "Add testimonial"}</h2>
            {editingId && (
              <button type="button" className="tm-reset-btn" onClick={resetForm}>
                + New
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="tm-form">
            <label className="tm-upload-box">
              <span>⬆ {uploadLabel}</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageFileChange}
              />
            </label>

            {(form.image || imageFile) && (
              <img
                className="tm-preview"
                src={imageFile ? URL.createObjectURL(imageFile) : getImageSrc(form.image)}
                alt="preview"
              />
            )}

            <div className="tm-field">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="tm-field">
              <label>Role/Type</label>
              <input name="role" value={form.role} onChange={handleChange} />
            </div>

            <div className="tm-field">
              <label>Trip</label>
              <input name="trip" value={form.trip} onChange={handleChange} />
            </div>

            <div className="tm-field">
              <label>Testimonial text</label>
              <textarea
                name="text"
                rows="4"
                value={form.text}
                onChange={handleChange}
                required
              />
            </div>

            <div className="tm-field">
              <label>Rating (1–5)</label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={form.rating}
                onChange={handleChange}
              />
            </div>

            {/* Optional image URL (if not uploading a file) */}
            <div className="tm-field">
              <label>Image URL (optional)</label>
              <input
                name="image"
                placeholder="https://... or /uploads/..."
                value={form.image}
                onChange={handleChange}
              />
              <small className="tm-hint">
                Leave empty to keep existing image when editing.
              </small>
            </div>

            <label className="tm-toggle">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Show on public site
            </label>

            <button className="tm-save-btn" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Publish"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="tm-card">
          <div className="tm-card-header">
            <h2>Existing testimonials</h2>
            {loading && <span>Loading…</span>}
          </div>

          {items.length === 0 && !loading ? (
            <p className="tm-empty">No testimonials yet.</p>
          ) : (
            <ul className="tm-list">
              {items.map((t) => (
                <li key={t._id} className="tm-item">
                  <img src={getImageSrc(t.image)} alt={t.name} />

                  <div className="tm-item-body">
                    <strong>{t.name}</strong>

                    <div className="tm-meta">
                      {t.role || "—"} • {t.trip || "—"} • ⭐{t.rating || 5}
                    </div>

                    <p className="tm-text">{t.text}</p>

                    <div className="tm-actions">
                      <button type="button" onClick={() => startEdit(t)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(t._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {!t.isActive && <span className="tm-hidden">Hidden</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default TestimonialManagement;
