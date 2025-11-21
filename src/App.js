// src/App.js (ADMIN APP)
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import AddCar from "./pages/AddCar";
import ManageBooking from "./pages/ManageBooking";
import BlogManagement from "./pages/BlogManagement";
import CarManagement from "./pages/CarManagement";
import Settings from "./pages/Settings";
import TestimonialManagement from "./pages/TestimonialManagement";
import NewsletterManagement from "./pages/NewsletterManagement";

import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminAuthProvider } from "./context/AdminAuthContext";

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public admin login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin area */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* /admin → Dashboard */}
              <Route index element={<Dashboard />} />

              {/* /admin/add-car */}
              <Route path="add-car" element={<AddCar />} />

              {/* /admin/manage-cars */}
              <Route path="manage-cars" element={<CarManagement />} />

              {/* /admin/manage-bookings */}
              <Route path="manage-bookings" element={<ManageBooking />} />

              {/* /admin/blog */}
              <Route path="blog" element={<BlogManagement />} />

              {/* /admin/testimonials */}
              <Route path="testimonials" element={<TestimonialManagement />} />

              {/* /admin/newsletter */}
              <Route path="newsletter" element={<NewsletterManagement />} />

              {/* /admin/settings */}
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Unknown route → go to /admin/login */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
