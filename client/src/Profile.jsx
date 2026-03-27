import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUserData({
            uid: user.uid,
            email: user.email,
            ...snap.data()
          });
        } else {
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: "Customer",
            points: 0,
            favoriteProductIds: []
          });
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔄 Loading
  if (loading) {
    return (
      <div>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ padding: "40px" }}>Loading profile...</div>
      </div>
    );
  }

  // ❌ Not logged in
  if (!userData) {
    return (
      <div>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div style={{ padding: "40px" }}>
          <h2>Please login first.</h2>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff7f0" }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        style={{
          padding: "40px",
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "Inter, sans-serif",
          color: "#4a3728"
        }}
      >
        <h1 style={{ marginBottom: "25px" }}>My Profile</h1>

        <div
          style={{
            background: "#f7efe8",
            padding: "25px",
            borderRadius: "18px",
            border: "1px solid #d9c7b8",
            boxShadow: "0 10px 20px rgba(0,0,0,0.05)"
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#6b4f3a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "800",
              marginBottom: "20px"
            }}
          >
            {(userData.displayName || userData.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <p><strong>Name:</strong> {userData.displayName || "Customer"}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Points:</strong> {userData.points || 0}</p>

          <p>
            <strong>Favorites:</strong>{" "}
            {Array.isArray(userData.favoriteProductIds)
              ? userData.favoriteProductIds.length
              : 0}
          </p>
        </div>

        <div style={{ marginTop: "25px" }}>
          <button
            onClick={() => navigate("/order-history")}
            style={{
              background: "#6b4f3a",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
}