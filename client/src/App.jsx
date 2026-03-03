// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Home from "./Home";
import Menu from "./Menu";
import About from "./About";
import Login from "./Login"; // admin login
import Admin from "./Admin";
import Signup from "./Signup"; // client signup
import ClientLogin from "./ClientLogin"; // client login
import ProtectedRoute from "./ProtectedRoute";
import ClientLogout from "./ClientLogout";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <Router>
      {/* Optional: Logout button always visible if client is logged in */}
      {localStorage.getItem("token") && <ClientLogout />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Admin login */}
        <Route path="/login" element={<Login setIsAdminLoggedIn={setIsAdminLoggedIn} />} />

        {/* Protected admin route */}
        <Route 
          path="/admin" 
          element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" replace />} 
        />

        {/* Client signup/login */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/client-login" element={<ClientLogin />} />

        {/* Protected client route */}
        <Route 
          path="/menu" 
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          } 
        />

        {/* Optional: Catch-all redirect for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}