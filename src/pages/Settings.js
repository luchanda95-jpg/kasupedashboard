import { useEffect, useState } from "react";
import "./Settings.css";

const API_BASE = "https://kasuper-server.onrender.com";

function Settings() {
  const token = localStorage.getItem("kasupe_admin_token");

  // ---------------- Change password ----------------
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [passMsg, setPassMsg] = useState("");

  // ---------------- Admin invite + list ----------------
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminMsg, setAdminMsg] = useState("");

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");

  const authFetch = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      setAdminMsg("");

      const res = await authFetch(`${API_BASE}/api/admin/users`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load admins");
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setAdminMsg(err.message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, []);

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");

    if (newPassword !== confirmNew) {
      setPassMsg("New passwords do not match.");
      return;
    }

    try {
      const res = await authFetch(
        `${API_BASE}/api/admin/users/me/password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");

      setPassMsg("Password updated successfully ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (err) {
      setPassMsg(err.message);
    }
  };

  // Invite admin handler
  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    setAdminMsg("");

    try {
      const res = await authFetch(
        `${API_BASE}/api/admin/users/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: inviteName,
            email: inviteEmail,
            password: invitePassword,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to invite admin");

      setAdminMsg("Admin added successfully ✅");
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      fetchAdmins();
    } catch (err) {
      setAdminMsg(err.message);
    }
  };

  // Remove admin (optional)
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Remove this admin?")) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove admin");

      fetchAdmins();
    } catch (err) {
      setAdminMsg(err.message);
    }
  };

  return (
    <section className="settings-page">
      <h1>Settings</h1>

      {/* -------- Change Password -------- */}
      <div className="settings-card">
        <h2>Change password</h2>
        {passMsg && <p className="settings-msg">{passMsg}</p>}

        <form onSubmit={handleChangePassword} className="settings-form">
          <label>
            Old password
            <input
              type="password"
              value={oldPassword}
              onChange={(e)=>setOldPassword(e.target.value)}
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={confirmNew}
              onChange={(e)=>setConfirmNew(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="settings-btn">
            Update password
          </button>
        </form>
      </div>

      {/* -------- Admin Members -------- */}
      <div className="settings-card">
        <h2>Admin members</h2>
        {adminMsg && <p className="settings-msg">{adminMsg}</p>}

        <form onSubmit={handleInviteAdmin} className="settings-form">
          <div className="settings-two-col">
            <label>
              Full name
              <input
                value={inviteName}
                onChange={(e)=>setInviteName(e.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={inviteEmail}
                onChange={(e)=>setInviteEmail(e.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Temporary password
            <input
              type="text"
              value={invitePassword}
              onChange={(e)=>setInvitePassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="settings-btn">
            Invite / Add admin
          </button>
        </form>

        <hr className="settings-divider" />

        {loadingAdmins ? (
          <p>Loading admins…</p>
        ) : admins.length === 0 ? (
          <p>No admins found.</p>
        ) : (
          <ul className="admin-list">
            {admins.map((a) => (
              <li key={a._id} className="admin-item">
                <div>
                  <strong>{a.name}</strong>
                  <div className="admin-email">{a.email}</div>
                </div>
                <button
                  type="button"
                  className="settings-btn danger"
                  onClick={() => handleDeleteAdmin(a._id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Settings;
