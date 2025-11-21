// src/components/Sidebar.js
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { assets } from "../assets/assets";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: assets.dashboardIcon },
  { to: "/admin/add-car", label: "Add Car", icon: assets.addIcon },
  { to: "/admin/manage-cars", label: "Manage Cars", icon: assets.car_icon }, // ✅ added
  {
    to: "/admin/manage-bookings",
    label: "Manage Bookings",
    icon: assets.listIcon,
  },
  { to: "/admin/blog", label: "Blog Management", icon: assets.edit_icon },
  { to: "/admin/settings", label: "Settings", icon: assets.settingsIcon }, // ✅ NEW
  { to: "/admin/testimonials", label: "Testimonials", icon: assets.reviewIcon },
  { to: "/admin/newsletter", label: "Newsletter", icon: assets.mailIcon }

];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("kasupe_admin_token");
    localStorage.removeItem("kasupe_admin_name");
    localStorage.removeItem("kasupe_admin_email");
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
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
  );
}

export default Sidebar;
