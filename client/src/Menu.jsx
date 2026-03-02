import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const API = "http://localhost:5000";

export default function Menu() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div style={{ background: "#fff7f0", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ textAlign: "center", padding: 40 }}>
        <h1 style={{ color: "#6b4f3a" }}>Our Menu</h1>

        {products.map(p => (
          <div key={p.id} style={{ margin: 20 }}>
            <img
              src={p.image ? API + p.image : "/placeholder.png"}
              width="200"
              style={{ borderRadius: 10 }}
            />
            <h3>{p.name}</h3>
            <p>₱{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}