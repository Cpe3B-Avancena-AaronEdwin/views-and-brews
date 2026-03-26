import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { logoutUser } from "./auth";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({
            uid: user.uid,
            email: user.email || "",
            ...userSnap.data()
          });
        } else {
          setUserData({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "Customer",
            points: 0,
            role: "customer",
            favoriteProductIds: []
          });
        }
      } catch (err) {
        console.error("Sidebar user load failed:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      onClose?.();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to logout.");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1999
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          width: "320px",
          maxWidth: "85vw",
          height: "100vh",
          background: "#fffaf6",
          boxShadow: "8px 0 30px rgba(0,0,0,0.12)",
          zIndex: 2000,
          transition: "transform 0.3s ease",
          padding: "70px 24px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflowY: "auto",
          boxSizing: "border-box"
        }}
      >
<button
  onClick={onClose}
  style={{
    position: "absolute",
    top: "18px",
    right: "18px",
    border: "none",
    background: "#6b4f3a",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    fontSize: "1.4rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2001
  }}
>
  ×
</button>

        {userData ? (
          <div
            onClick={() => {
              onClose?.();
              navigate("/profile");
            }}
            style={{
              background: "#f7efe8",
              border: "1px solid #d9c7b8",
              borderRadius: "22px",
              padding: "22px",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                background: "#7a5a43",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "2rem",
                marginBottom: "14px"
              }}
            >
              {(userData.displayName || userData.email || "U").charAt(0).toUpperCase()}
            </div>

            <h3 style={{ margin: "0 0 6px 0", color: "#4a3728", fontSize: "1.9rem" }}>
              {userData.displayName || "Customer"}
            </h3>

            <p
              style={{
                margin: "0 0 8px 0",
                color: "#7a6a5c",
                fontSize: "1rem",
                wordBreak: "break-word"
              }}
            >
              {userData.email}
            </p>

            <p style={{ margin: "0 0 6px 0", color: "#7a6a5c", fontSize: "1rem" }}>
              Points: {Number(userData.points || 0)}
            </p>

            <p style={{ margin: 0, color: "#7a6a5c", fontSize: "0.95rem" }}>
              Favorites: {Array.isArray(userData.favoriteProductIds) ? userData.favoriteProductIds.length : 0}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "#f7efe8",
              border: "1px solid #d9c7b8",
              borderRadius: "22px",
              padding: "22px"
            }}
          >
            <h3 style={{ marginTop: 0, color: "#4a3728" }}>Welcome</h3>
            <p style={{ color: "#7a6a5c", marginBottom: "14px" }}>
              Login to place orders, save favorites, and view your profile.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link to="/login" onClick={onClose} style={primaryBtn}>
                Login
              </Link>
              <Link to="/register" onClick={onClose} style={outlineBtn}>
                Register
              </Link>
            </div>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/" onClick={onClose} style={navLink(isActive("/"))}>
            Home
          </Link>

          <Link to="/about" onClick={onClose} style={navLink(isActive("/about"))}>
            About
          </Link>


          {userData && (
            <>
              <Link to="/profile" onClick={onClose} style={navLink(isActive("/profile"))}>
                My Profile
              </Link>

              <Link
                to="/order-history"
                onClick={onClose}
                style={navLink(isActive("/order-history"))}
              >
                Order History
              </Link>
            </>
          )}

          {userData?.role === "admin" && (
            <Link to="/admin" onClick={onClose} style={navLink(isActive("/admin"))}>
              Admin Dashboard
            </Link>
          )}
        </nav>

        {userData && (
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        )}
      </aside>
    </>
  );
}

const navLink = (active) => ({
  textDecoration: "none",
  color: active ? "#fff" : "#4a3728",
  fontWeight: "800",
  padding: "16px 18px",
  borderRadius: "16px",
  background: active ? "#6b4f3a" : "#f7f2ee",
  boxShadow: active ? "0 8px 18px rgba(107,79,58,0.18)" : "none"
});

const primaryBtn = {
  textDecoration: "none",
  background: "#6b4f3a",
  color: "white",
  padding: "10px 16px",
  borderRadius: "10px",
  fontWeight: "700"
};

const outlineBtn = {
  textDecoration: "none",
  background: "transparent",
  color: "#6b4f3a",
  border: "1px solid #6b4f3a",
  padding: "10px 16px",
  borderRadius: "10px",
  fontWeight: "700"
};

const logoutBtn = {
  border: "none",
  background: "#c62828",
  color: "white",
  padding: "14px 16px",
  borderRadius: "14px",
  fontWeight: "800",
  cursor: "pointer",
  width: "100%",
  marginTop: "8px",
  marginBottom: "8px",
  flexShrink: 0
};