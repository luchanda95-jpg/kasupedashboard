// src/utils/adminApi.js
const API_BASE = "https://kasuper-server.onrender.com";

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
