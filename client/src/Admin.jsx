import { useState, useEffect } from "react";
import Navbar from "./Navbar";

const API = "http://localhost:5000";

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  // Product Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  // Ingredient Form States
  const [ingredientName, setIngredientName] = useState("");
  const [stock, setStock] = useState("");
  const [ingPrice, setIngPrice] = useState("");

  /* ================= FETCH LOGIC ================= */
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error("Fetch products error:", err); }
  };

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${API}/api/ingredients`);
      const data = await res.json();
      setIngredients(data);
    } catch (err) { console.error("Fetch ingredients error:", err); }
  };

  useEffect(() => {
    fetchProducts();
    fetchIngredients();
  }, []);

  /* ================= PRODUCT ACTIONS ================= */
  const addProduct = async () => {
    if (!name.trim() || !category || !price) {
      return alert("Fill in name, category, and price");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("price", Number(price));
    if (image) formData.append("image", image);

    const res = await fetch(`${API}/api/products`, { method: "POST", body: formData });
    if (res.ok) {
      setName("");
      setCategory("");
      setPrice("");
      setImage(null);
      fetchProducts();
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  /* ================= INGREDIENT ACTIONS ================= */
  const addIngredient = async () => {
    if (!ingredientName || !stock || !ingPrice) return alert("Fill all fields");
    try {
      const res = await fetch(`${API}/api/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ingredientName,
          stock: Number(stock),
          price: Number(ingPrice)
        })
      });
      if (res.ok) {
        setIngredientName(""); setStock(""); setIngPrice("");
        fetchIngredients();
      }
    } catch (err) { console.error("Add ingredient error:", err); }
  };

  // FIXED UPDATE STOCK FUNCTION
  const updateStock = async (id, change) => {
    try {
      const res = await fetch(`${API}/api/ingredients/${id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change })
      });
      if (res.ok) {
        fetchIngredients();
      }
    } catch (err) {
      console.error("Update stock error:", err);
    }
  };

  const deleteIngredient = async (id) => {
    if (window.confirm("Delete this ingredient?")) {
      await fetch(`${API}/api/ingredients/${id}`, { method: "DELETE" });
      fetchIngredients();
    }
  };

  return (
    <div className="admin-container">
      <Navbar />

      <main className="admin-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your inventory and products seamlessly.</p>
          
          <nav className="tab-navigation">
            <button className={tab === "products" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("products")}>
              <span className="icon">☕</span> Products
            </button>
            <button className={tab === "ingredients" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("ingredients")}>
              <span className="icon">🌿</span> Ingredients
            </button>
          </nav>
        </header>

        <section className="main-section">
          {tab === "products" ? (
            <div className="glass-card">
              <div className="card-header"><h2>Product Management</h2></div>
              <div className="form-group">
                <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />

                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select Category</option>
                  <option value="Coffee Based">Coffee Based</option>
                  <option value="Non-Coffee Based">Non-Coffee Based</option>
                  <option value="Matcha Series">Matcha Series</option>
                  <option value="Chocolate Series">Chocolate Series</option>
                  <option value="Barista's Choice">Barista's Choice</option>
                  <option value="Soda">Soda</option>
                  <option value="Dirty Soda">Dirty Soda</option>
                </select>

                <input placeholder="Price (₱)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                <div className="file-input-wrapper">
                   <input type="file" id="prod-img" className="file-input" onChange={(e) => setImage(e.target.files[0])} />
                   <label htmlFor="prod-img">{image ? "Image Selected" : "Choose Image"}</label>
                </div>
                <button className="btn-primary" onClick={addProduct}>Add Product</button>
              </div>

              <div className="table-wrapper">
                <table className="black-border-table">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td><div className="img-center-wrapper"><img src={p.image ? API + p.image : "/placeholder.png"} className="table-img" /></div></td>
                        <td className="font-bold">{p.name}</td>
                        <td>{p.category}</td>
                        <td className="price-tag">₱{Number(p.price).toLocaleString()}</td>
                        <td><button className="btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-card">
              <div className="card-header"><h2>Ingredients Inventory</h2></div>
              <div className="form-group">
                <input placeholder="Ingredient Name" value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} />
                <input placeholder="Stock Qty" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                <input placeholder="Price/Unit (₱)" type="number" value={ingPrice} onChange={(e) => setIngPrice(e.target.value)} />
                <button className="btn-primary" onClick={addIngredient}>Add Item</button>
              </div>

              <div className="table-wrapper">
                <table className="black-border-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Current Stock</th>
                      <th>Unit Price</th>
                      <th>Total Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((i) => (
                      <tr key={i.id}>
                        <td className="font-bold">{i.name}</td>
                        <td>
                          <div className="stock-control">
                            <button onClick={() => updateStock(i.id, -1)} className="stock-btn">-</button>
                            <span className="stock-val">{i.stock}</span>
                            <button onClick={() => updateStock(i.id, 1)} className="stock-btn">+</button>
                          </div>
                        </td>
                        <td className="price-tag">₱{i.price}</td>
                        <td className="total-val">₱{(i.stock * i.price).toLocaleString()}</td>
                        <td><button className="btn-danger" onClick={() => deleteIngredient(i.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="inventory-footer">
                <h3>Total Inventory Value: <span>₱{ingredients.reduce((sum, i) => sum + i.stock * i.price, 0).toLocaleString()}</span></h3>
              </div>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .admin-container {
        background-color: #fff7f0;
          //background-image: url("/background.jpg"); BACKGROUND
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          color: #4a3728;
        }

        .admin-content { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
        .admin-header { text-align: center; margin-bottom: 2rem; }
        .admin-header h1 { font-size: 2.4rem; color: #6b4f3a; margin: 0; font-weight: 800; }
        
        .tab-navigation { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
        .nav-btn { padding: 10px 24px; border: 2px solid #6b4f3a; border-radius: 50px; background: rgba(255,255,255,0.8); cursor: pointer; font-weight: 700; color: #6b4f3a; }
        .nav-btn.active { background: #6b4f3a; color: #fff; }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid #000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .form-group {
          display: flex; gap: 10px; margin-bottom: 2rem; padding: 1.2rem;
          background: #fbf9f7; border-radius: 12px; border: 1px solid #000;
          justify-content: center; align-items: center;
        }

        input, select { padding: 10px; border: 1px solid #000; border-radius: 8px; width: 160px; }
        .btn-primary { background: #6b4f3a; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

        /* BLACK BORDER TABLE STYLES */
        .black-border-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .black-border-table th, .black-border-table td {
          border: 1px solid #000;
          padding: 12px;
          text-align: center;
        }
        .black-border-table th { background: #f2ede9; font-size: 0.85rem; }

        .table-img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #000; }
        .img-center-wrapper { display: flex; justify-content: center; }

        .font-bold { font-weight: 700; color: #4a3728; }
        .price-tag { font-weight: 700; color: #2e7d32; }
        .total-val { font-weight: 800; color: #6b4f3a; }

        .btn-danger {
          background: #b3261e;
          color: white;
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .stock-control {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .stock-btn {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: #6b4f3a;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .stock-val { min-width: 24px; font-weight: 700; }

        .inventory-footer {
          margin-top: 1.5rem;
          text-align: right;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .inventory-footer span { color: #2e7d32; }

        .file-input { display: none; }
        .file-input-wrapper label {
          display: inline-block;
          padding: 10px 16px;
          background: #6b4f3a;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .form-group {
            flex-direction: column;
          }

          input, select {
            width: 100%;
          }

          .table-wrapper {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}