// src/pages/AdminLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_BASE = "http://localhost:5000";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("kasupecarhire@gmail.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Login failed");
      }

      const data = await res.json();
      // data: { token, user: { id, email, name, role } }

      login(data.token, data.user);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p className="admin-login-sub">
          Sign in to manage cars, bookings and blog posts.
        </p>

        {errorMsg && <p className="admin-login-error">{errorMsg}</p>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="kasupecarhire@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
            />
          </div>

          <div className="admin-login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AdminLogin;
