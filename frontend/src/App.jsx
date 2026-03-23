import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './modules/performanceAnalytics/pages/Dashboard';
import Forecasting from './modules/performanceAnalytics/pages/Forecasting';
import Alerts from './modules/performanceAnalytics/pages/Alerts';
import ConversationalBI from './modules/chatbot/pages/ConversationalBI';
import Reports from './modules/performanceAnalytics/pages/Reports';

import SearchPage from './modules/hotelRoom/pages/SearchPage';
import SearchResults from './modules/hotelRoom/pages/SearchResults';
import HotelDetails from './modules/hotelRoom/pages/HotelDetails';
import Checkout from './modules/hotelRoom/pages/Checkout';
import MyTrips from './modules/hotelRoom/pages/MyTrips';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/hotels/search" element={<SearchPage />} />
        <Route path="/hotels/results" element={<SearchResults />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/hotels/checkout" element={<Checkout />} />
        <Route path="/my-trips" element={<MyTrips />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forecast" element={<Forecasting />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="bi" element={<ConversationalBI />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
