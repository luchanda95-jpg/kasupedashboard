// src/pages/AdminLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_BASE = "https://kasuper-server.onrender.com"; // make sure this URL is correct

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let msg = "Login failed";
        try {
          const errData = await res.json();
          if (errData?.message) msg = errData.message;
        } catch {
          // body not JSON
        }
        throw new Error(msg);
      }

      const data = await res.json();
      if (!data?.token) throw new Error("Server did not return a token.");

      login(data.token, data.user);
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err.name === "AbortError") {
        setErrorMsg(
          "Server is taking too long to respond. If you’re using Render free tier, the server may be sleeping."
        );
      } else {
        setErrorMsg(err.message || "Login failed");
      }
    } finally {
      clearTimeout(timeoutId);
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
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="admin-login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
