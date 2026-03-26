import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function OrderHistory() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const q = query(collection(db, "orders"), where("userId", "==", user.uid));

      unsubscribeOrders = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aMs =
            a.completedAt?.seconds
              ? a.completedAt.seconds * 1000
              : a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : 0;

          const bMs =
            b.completedAt?.seconds
              ? b.completedAt.seconds * 1000
              : b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : 0;

          return bMs - aMs;
        });

        setOrders(data);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff7f0" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "28px",
            border: "1px solid #e7d8cc",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            padding: "32px"
          }}
        >
          <h1 style={{ marginTop: 0, color: "#4a3728" }}>Order History</h1>

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: "#7a6a5c" }}>No orders yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: "#fbf9f7",
                    border: "1px solid #eadfd6",
                    borderRadius: "18px",
                    padding: "18px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "12px"
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 6px 0" }}>Order #{order.id.slice(0, 6)}</h3>
                      <p style={{ margin: 0, color: "#7a6a5c" }}>
                        {order.createdAt?.seconds
                          ? new Date(order.createdAt.seconds * 1000).toLocaleString("en-PH")
                          : "No date"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={statusBadge(order.status)}>{order.status}</span>
                      <p style={{ margin: "8px 0 0 0", fontWeight: "800", color: "#4a3728" }}>
                        ₱{Number(order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "10px" }}>
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#fff",
                          border: "1px solid #eee2d9",
                          borderRadius: "12px",
                          padding: "12px"
                        }}
                      >
                        <strong>{item.name}</strong>
                        <p style={{ margin: "6px 0 0 0", color: "#7a6a5c" }}>
                          Qty: {item.quantity} · ₱
                          {Number(
                            item.subtotal ||
                              Number(item.price || 0) * Number(item.quantity || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const statusBadge = (status) => ({
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "0.8rem",
  fontWeight: "800",
  textTransform: "capitalize",
  background:
    status === "completed" ? "#eaf7ee" :
    status === "voided" ? "#fdecea" : "#f4eee9",
  color:
    status === "completed" ? "#2e7d32" :
    status === "voided" ? "#b3261e" : "#8a6c54"
});