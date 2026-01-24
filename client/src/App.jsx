import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BookingPage from './pages/BookingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="reservar" element={<BookingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
