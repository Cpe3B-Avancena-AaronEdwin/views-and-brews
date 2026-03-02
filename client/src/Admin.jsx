import { useState, useEffect } from "react";
import Navbar from "./Navbar";

const API = "http://localhost:5000";

export default function Admin() {
  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const [ingredientName, setIngredientName] = useState("");
  const [stock, setStock] = useState("");

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    setProducts(data);
  };

  const fetchIngredients = async () => {
    const res = await fetch(`${API}/api/ingredients`);
    const data = await res.json();
    setIngredients(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchIngredients();
  }, []);

  /* ================= PRODUCTS ================= */

  const addProduct = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    if (image) formData.append("image", image);

    await fetch(`${API}/api/products`, {
      method: "POST",
      body: formData
    });

    setName("");
    setPrice("");
    setImage(null);
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  /* ================= INGREDIENTS ================= */

  const addIngredient = async () => {
  if (!ingredientName || !stock || !price) return;

  await fetch(`${API}/api/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: ingredientName,
      stock: Number(stock),
      price: Number(price)
    })
  });

  setIngredientName("");
  setStock("");
  setPrice("");
  fetchIngredients();
};

  const deleteIngredient = async (id) => {
    await fetch(`${API}/api/ingredients/${id}`, {
      method: "DELETE"
    });
    fetchIngredients();
  };

  const updateStock = async (id, change) => {
    await fetch(`${API}/api/ingredients/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change })
    });
    fetchIngredients();
  };

  /* ================= UI ================= */

  const tabStyle = (active) => ({
    padding: "10px 20px",
    marginRight: 10,
    border: "none",
    borderRadius: 6,
    background: active ? "#6b4f3a" : "#ddd",
    color: active ? "#fff" : "#333",
    cursor: "pointer"
  });

  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  };

  return (
    <div style={{ background: "#fff7f0", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: 900, margin: "auto", padding: 40 }}>
        <h1 style={{ color: "#6b4f3a" }}>Admin Dashboard</h1>

        <div style={{ marginBottom: 20 }}>
          <button style={tabStyle(tab === "products")} onClick={() => setTab("products")}>
            Products
          </button>

          <button style={tabStyle(tab === "ingredients")} onClick={() => setTab("ingredients")}>
            Ingredients
          </button>
        </div>

        {/* ================= PRODUCTS ================= */}

        {tab === "products" && (
          <div style={card}>
            <h2>Products</h2>

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input type="file" onChange={(e) => setImage(e.target.files[0])} />

            <button onClick={addProduct}>Add</button>

            <hr />

            {products.map((p) => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <img
                  src={p.image ? API + p.image : "/placeholder.png"}
                  width="80"
                  style={{ borderRadius: 8 }}
                />
                {" "}
                {p.name} — ₱{p.price}
                <button onClick={() => deleteProduct(p.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* ================= INGREDIENTS ================= */}

        {tab === "ingredients" && (
  <div style={card}>
    <h2>Ingredients Inventory</h2>

    <div style={{ marginBottom: 15 }}>
      <input
        placeholder="Name"
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
      />

      <input
        placeholder="Stock"
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />

      <input
        placeholder="Price per unit"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={addIngredient}>Add</button>
    </div>

    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#6b4f3a", color: "white" }}>
          <th>Name</th>
          <th>Stock</th>
          <th>Price</th>
          <th>Total Value</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {ingredients.map((i) => (
          <tr key={i.id}>
            <td>{i.name}</td>
            <td>{i.stock}</td>
            <td>₱{i.price}</td>
            <td>₱{(i.stock * i.price).toFixed(2)}</td>
            <td>
              <button onClick={() => updateStock(i.id, 1)}>+</button>
              <button onClick={() => updateStock(i.id, -1)}>-</button>
              <button onClick={() => deleteIngredient(i.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3 style={{ marginTop: 20 }}>
      Total Inventory Value: ₱
      {ingredients
        .reduce((sum, i) => sum + i.stock * i.price, 0)
        .toFixed(2)}
    </h3>
  </div>
)}
      </div>
    </div>
  );
}