// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Home from "./Home";
import Menu from "./Menu";
import About from "./About";
import Login from "./Login";
import Admin from "./Admin";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setIsAdminLoggedIn={setIsAdminLoggedIn} />} />

        {/* Protected route for admin */}
        <Route 
          path="/admin" 
          element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}