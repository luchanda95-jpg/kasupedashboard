// src/pages/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const API_BASE = "http://localhost:5000";

export default function Login() {
  const nav = useNavigate();
  const { login } = useUserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.message || "Login failed");
      }
      const data = await res.json();
      login(data.token, data.user);
      nav("/cars");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <section style={{ padding: "2rem" }}>
      <h1>Login</h1>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button>Login</button>
      </form>
    </section>
  );
}
