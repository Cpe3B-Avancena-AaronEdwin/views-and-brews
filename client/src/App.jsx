import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./styles.css";

import Sidebar from "./Sidebar";
import Home from "./Home";
import About from "./About";
import Menu from "./Menu";
import Login from "./Login";
import Admin from "./Admin";
import Signup from "./Signup";
import ClientLogin from "./ClientLogin";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Router>
      {/* Hamburger */}
      <button className="hamburger-btn" onClick={toggleSidebar}>☰</button>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={<Login setIsAdminLoggedIn={setIsAdminLoggedIn} />} />
          <Route path="/admin" element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" replace />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/client-login" element={<ClientLogin />} />

          <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}