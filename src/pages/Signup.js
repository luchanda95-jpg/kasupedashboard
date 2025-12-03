// src/pages/Signup.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const API_BASE = "https://kasuper-server-84g2.onrender.com";

export default function Signup() {
  const nav = useNavigate();
  const { login } = useUserAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.message || "Signup failed");
      }
      const data = await res.json();
      login(data.token, data.user);
      nav("/cars");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: "2rem" }}>
      <h1>Create account</h1>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <input
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
    </section>
  );
}
