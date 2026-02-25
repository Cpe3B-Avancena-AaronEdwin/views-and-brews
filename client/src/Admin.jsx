// client/src/Admin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateStock = async (id, newStock) => {
    try {
      await axios.put(`${API_URL}/update-stock/${id}`, { stock: newStock });
      fetchProducts(); // refresh products
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <h1>Admin Dashboard</h1>

      {/* Navigation Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            backgroundColor: "#222",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Back to Login
        </button>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#222",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Back to Home
        </button>
      </div>

      {/* Products Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Product</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Price</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Stock</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{p.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>₱{p.price}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                <input
                  type="number"
                  value={p.stock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setProducts((prev) =>
                      prev.map((prod) => (prod.id === p.id ? { ...prod, stock: value } : prod))
                    );
                  }}
                  style={{ width: "60px" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                <button onClick={() => updateStock(p.id, p.stock)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}