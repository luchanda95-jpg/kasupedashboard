// src/utils/adminApi.js

// ✅ Production-ready API base.
// - In production builds it will use your Render URL.
// - In development, you can override with REACT_APP_API_BASE if you want.
export const API_BASE =
  process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://kasuper-server-84g2.onrender.com");

/**
 * Wrapper around fetch for ADMIN calls.
 * - Prefixes API_BASE
 * - Injects Authorization: Bearer <token> if provided
 */
export async function adminFetch(path, options = {}, token) {
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return res;
}
