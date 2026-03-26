import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import Home from "./Home";
import Menu from "./Menu";
import About from "./About";
import Login from "./Login";
import Register from "./Register";
import Admin from "./Admin";
import Profile from "./Profile";
import OrderHistory from "./OrderHistory";

import { auth } from "./firebase";
import { getUserRole } from "./auth";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdminLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        const role = await getUserRole(user.uid);
        setIsAdminLoggedIn(role === "admin");
      } catch (error) {
        console.error("Role check failed:", error);
        setIsAdminLoggedIn(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: "40px" }}>Checking access.</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setIsAdminLoggedIn={setIsAdminLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route
          path="/admin"
          element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}