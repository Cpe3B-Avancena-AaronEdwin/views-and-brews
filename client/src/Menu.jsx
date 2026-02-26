// client/src/Menu.jsx
import { useState, useEffect } from "react";
import Layout from "./Layout";

const API = "http://localhost:5000";

export default function Menu() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Layout>
      <h1 style={{ textAlign: "center", color: "#6b4f4f" }}>Our Menu</h1>
      {products.length === 0 ? (
        <p style={{ textAlign: "center" }}>No products available</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {products.map((p) => (
            <li key={p.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 15,
              border: "1px solid #e0d4c0",
              borderRadius: 8,
              marginBottom: 10,
              backgroundColor: "#fff",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)"
            }}>
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontWeight: 600, color: "#6b4f4f" }}>₱{p.price}</span>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}