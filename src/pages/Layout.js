// src/pages/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Layout.css";

function Layout() {
  return (
    <div className="admin-shell">
      <Sidebar />

      <main className="admin-main">
        {/* This is where Dashboard / AddCar / etc. will appear */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
