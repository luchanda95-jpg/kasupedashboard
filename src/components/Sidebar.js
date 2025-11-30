// src/components/Sidebar.js
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";
import { assets } from "../assets/assets";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: assets.dashboardIcon },
  { to: "/admin/add-car", label: "Add Car", icon: assets.addIcon },
  { to: "/admin/manage-cars", label: "Manage Cars", icon: assets.car_icon },
  {
    to: "/admin/manage-bookings",
    label: "Manage Bookings",
    icon: assets.listIcon,
  },
  { to: "/admin/blog", label: "Blog Management", icon: assets.edit_icon },
  { to: "/admin/settings", label: "Settings", icon: assets.settingsIcon },
  { to: "/admin/testimonials", label: "Testimonials", icon: assets.reviewIcon },
  { to: "/admin/newsletter", label: "Newsletter", icon: assets.mailIcon },
];

function Sidebar() {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("kasupe_admin_token");
    localStorage.removeItem("kasupe_admin_name");
    localStorage.removeItem("kasupe_admin_email");
    setIsMobileOpen(false);
    navigate("/admin/login", { replace: true });
  };

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* 🔔 Hamburger button (mobile only, via CSS) */}
      <button
        type="button"
        className={`admin-sidebar-toggle ${
          isMobileOpen ? "admin-sidebar-toggle--open" : ""
        }`}
        onClick={toggleMobile}
        aria-label="Toggle admin menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Dark backdrop on mobile when menu is open */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar itself */}
      <aside
        className={`admin-sidebar ${
          isMobileOpen ? "admin-sidebar--open" : ""
        }`}
      >
        <div className="admin-sidebar-logo">
          {assets.logo && (
            <img
              src={assets.logo}
              alt="Kasupe"
              className="admin-sidebar-logo-img"
            />
          )}
          <span className="admin-sidebar-title">Admin Panel</span>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                isActive
                  ? "admin-nav-link admin-nav-link--active"
                  : "admin-nav-link"
              }
              onClick={closeMobile} // close drawer after choosing on mobile
            >
              {item.icon && (
                <img src={item.icon} alt="" className="admin-nav-icon" />
              )}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
