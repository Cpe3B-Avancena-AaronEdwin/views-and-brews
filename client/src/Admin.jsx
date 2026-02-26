import { useState, useEffect } from "react";

const API = "http://localhost:5000";

export default function Admin() {
  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  const [ingredientName, setIngredientName] = useState("");
  const [stock, setStock] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${API}/api/ingredients`);
      const data = await res.json();
      setIngredients(Array.isArray(data) ? data : []);
    } catch {
      setIngredients([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchIngredients();
  }, []);

  /* ================= PRODUCTS ================= */

  const addProduct = async () => {
    if (!productName.trim() || !price) {
      alert("Enter product name and price");
      return;
    }

    try {
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName, price: Number(price) })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add product");
        return;
      }

      setProductName("");
      setPrice("");
      fetchProducts();

    } catch (err) {
      console.error(err);
      alert("Server not responding");
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete product");
        return;
      }

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Server not responding");
    }
  };

  /* ================= INGREDIENTS ================= */

  const addIngredient = async () => {
    if (!ingredientName.trim() || !stock) return;

    try {
      await fetch(`${API}/api/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ingredientName, stock: Number(stock) })
      });

      setIngredientName("");
      setStock("");
      fetchIngredients();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteIngredient = async (id) => {
    try {
      await fetch(`${API}/api/ingredients/${id}`, { method: "DELETE" });
      fetchIngredients();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UI ================= */

  const tabButtonStyle = (active) => ({
    padding: "10px 20px",
    marginRight: 10,
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    backgroundColor: active ? "#6b4f4f" : "#ccc",
    color: active ? "#fff" : "#333",
    fontWeight: active ? "bold" : "normal"
  });

  const inputStyle = {
    padding: 8,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 4,
    border: "1px solid #ccc"
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: 4,
    backgroundColor: "#6b4f4f",
    color: "#fff",
    cursor: "pointer",
    marginBottom: 10
  };

  const listStyle = {
    listStyle: "none",
    padding: 0
  };

  const listItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 5,
    border: "1px solid #ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9"
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#6b4f4f" }}>Views and Brews Admin Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <button style={tabButtonStyle(tab === "products")} onClick={() => setTab("products")}>Products</button>
        <button style={tabButtonStyle(tab === "ingredients")} onClick={() => setTab("ingredients")}>Ingredients</button>
      </div>

      {tab === "products" && (
        <div>
          <h2 style={{ color: "#333" }}>Products</h2>

          <div>
            <input
              style={inputStyle}
              placeholder="Product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button style={buttonStyle} onClick={addProduct}>Add Product</button>
          </div>

          <ul style={listStyle}>
            {products.length === 0 ? (
              <p>No products</p>
            ) : (
              products.map((p) => (
                <li key={p.id} style={listItemStyle}>
                  <span>{p.name} — ₱{p.price}</span>
                  <button style={{ ...buttonStyle, backgroundColor: "#c94c4c" }} onClick={() => deleteProduct(p.id)}>Delete</button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {tab === "ingredients" && (
        <div>
          <h2 style={{ color: "#333" }}>Ingredients</h2>

          <div>
            <input
              style={inputStyle}
              placeholder="Ingredient name"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <button style={buttonStyle} onClick={addIngredient}>Add Ingredient</button>
          </div>

          <ul style={listStyle}>
            {ingredients.length === 0 ? (
              <p>No ingredients</p>
            ) : (
              ingredients.map((i) => (
                <li key={i.id} style={listItemStyle}>
                  <span>{i.name} — {i.stock}</span>
                  <button style={{ ...buttonStyle, backgroundColor: "#c94c4c" }} onClick={() => deleteIngredient(i.id)}>Delete</button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}