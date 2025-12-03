// src/pages/FooterInfoManagement.js
import { useEffect, useState } from "react";
import "./FooterInfoManagement.css";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminFetch } from "../utils/adminApi";

function FooterInfoManagement() {
  const { token } = useAdminAuth();

  const [form, setForm] = useState({
    helpTitle: "Help Center",
    helpText: "",
    termsTitle: "Terms of Service",
    termsText: "",
    privacyTitle: "Privacy Policy",
    privacyText: "",
    insuranceTitle: "Insurance",
    insuranceText: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchFooterInfo = async () => {
      try {
        setLoading(true);
        setStatus({ type: "", message: "" });

        const res = await adminFetch("/api/admin/footer-info", {}, token);

        if (!res.ok) {
          throw new Error("Footer info API not ready yet");
        }

        const data = await res.json();
        console.log("Loaded footer info:", data);

        setForm({
          helpTitle: data?.help?.title || "Help Center",
          helpText: data?.help?.text || "",
          termsTitle: data?.terms?.title || "Terms of Service",
          termsText: data?.terms?.text || "",
          privacyTitle: data?.privacy?.title || "Privacy Policy",
          privacyText: data?.privacy?.text || "",
          insuranceTitle: data?.insurance?.title || "Insurance",
          insuranceText: data?.insurance?.text || "",
        });
      } catch (err) {
        console.warn("Footer info API not reachable, using defaults.", err);
        setStatus({
          type: "error",
          message:
            "Footer info API not reachable. You can still fill the form and save once the API is ready.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFooterInfo();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      help: {
        title: form.helpTitle.trim(),
        text: form.helpText.trim(),
      },
      terms: {
        title: form.termsTitle.trim(),
        text: form.termsText.trim(),
      },
      privacy: {
        title: form.privacyTitle.trim(),
        text: form.privacyText.trim(),
      },
      insurance: {
        title: form.insuranceTitle.trim(),
        text: form.insuranceText.trim(),
      },
    };

    try {
      const res = await adminFetch(
        "/api/admin/footer-info",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.message || "Failed to save footer information."
        );
      }

      setStatus({
        type: "success",
        message: "Footer information saved successfully.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message:
          err.message ||
          "Could not save footer information. Please check if the API is running.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="footer-info-admin-page">
      <div className="footer-info-admin-inner">
        <header className="footer-info-admin-header">
          <div>
            <h1>Footer & Legal Content</h1>
            <p>
              Edit the text that appears in the footer for Help Center, Terms of
              Service, Privacy Policy and Insurance.
            </p>
          </div>
        </header>

        {status.message && (
          <p
            className={`footer-info-status footer-info-status-${
              status.type === "success" ? "success" : "error"
            }`}
          >
            {status.message}
          </p>
        )}

        {loading ? (
          <p className="footer-info-loading">Loading footer content…</p>
        ) : (
          <form className="footer-info-form" onSubmit={handleSubmit}>
            {/* HELP CENTER */}
            <div className="footer-info-block">
              <h2>Help Center</h2>
              <div className="footer-info-field">
                <label>Panel title</label>
                <input
                  type="text"
                  name="helpTitle"
                  value={form.helpTitle}
                  onChange={handleChange}
                  placeholder="Help Center"
                />
              </div>
              <div className="footer-info-field">
                <label>Text / description</label>
                <textarea
                  name="helpText"
                  rows={3}
                  value={form.helpText}
                  onChange={handleChange}
                  placeholder="Explain how customers can get help or support."
                />
              </div>
            </div>

            {/* TERMS */}
            <div className="footer-info-block">
              <h2>Terms of Service</h2>
              <div className="footer-info-field">
                <label>Panel title</label>
                <input
                  type="text"
                  name="termsTitle"
                  value={form.termsTitle}
                  onChange={handleChange}
                  placeholder="Terms of Service"
                />
              </div>
              <div className="footer-info-field">
                <label>Text / summary</label>
                <textarea
                  name="termsText"
                  rows={4}
                  value={form.termsText}
                  onChange={handleChange}
                  placeholder="Short summary of your rental terms (non-legal)."
                />
              </div>
            </div>

            {/* PRIVACY */}
            <div className="footer-info-block">
              <h2>Privacy Policy</h2>
              <div className="footer-info-field">
                <label>Panel title</label>
                <input
                  type="text"
                  name="privacyTitle"
                  value={form.privacyTitle}
                  onChange={handleChange}
                  placeholder="Privacy Policy"
                />
              </div>
              <div className="footer-info-field">
                <label>Text / summary</label>
                <textarea
                  name="privacyText"
                  rows={4}
                  value={form.privacyText}
                  onChange={handleChange}
                  placeholder="Explain briefly how you handle customer data."
                />
              </div>
            </div>

            {/* INSURANCE */}
            <div className="footer-info-block">
              <h2>Insurance</h2>
              <div className="footer-info-field">
                <label>Panel title</label>
                <input
                  type="text"
                  name="insuranceTitle"
                  value={form.insuranceTitle}
                  onChange={handleChange}
                  placeholder="Insurance"
                />
              </div>
              <div className="footer-info-field">
                <label>Text / summary</label>
                <textarea
                  name="insuranceText"
                  rows={4}
                  value={form.insuranceText}
                  onChange={handleChange}
                  placeholder="Summarise what is covered and what is not."
                />
              </div>
            </div>

            <div className="footer-info-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save footer content"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default FooterInfoManagement;
