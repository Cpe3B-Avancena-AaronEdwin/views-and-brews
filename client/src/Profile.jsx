import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // 🔄 Loading state
  if (loading) {
    return <div style={{ padding: "20px" }}>Loading profile...</div>;
  }

  // ❌ Not logged in
  if (!userData) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Please login first.</h2>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "Inter, sans-serif",
        color: "#4a3728"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>My Profile</h1>

      <div
        style={{
          background: "#f7efe8",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #d9c7b8"
        }}
      >
        <p style={{ marginBottom: "10px" }}>
          <strong>Name:</strong>{" "}
          {userData.displayName || "Customer"}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong>Email:</strong> {userData.email}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong>Points:</strong> {userData.points || 0}
        </p>

        <p style={{ marginBottom: "10px" }}>
          <strong>Favorites:</strong>{" "}
          {Array.isArray(userData.favoriteProductIds)
            ? userData.favoriteProductIds.length
            : 0}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/order-history")}
          style={{
            background: "#6b4f3a",
            color: "white",
            padding: "12px 18px",
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
  );
}