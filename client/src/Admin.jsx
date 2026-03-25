import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
const API = "http://localhost:5000";

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const newShift = async () => {
    if (!window.confirm("Start a new shift? Current dashboard values will move to history.")) return;

    try {
      const res = await fetch(`${API}/api/admin/new-shift`, {
        method: "POST"
      });

      const data = await res.json();
      alert(data.message);

      fetchProducts();
      fetchIngredients();
      fetchCostingAnalysis();
      fetchProfitInsights();
    } catch (err) {
      console.error("New shift error:", err);
    }
  };

  // Product Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  // Ingredient Form States
  const [ingredientName, setIngredientName] = useState("");
  const [ingUnit, setIngUnit] = useState("pcs");
  const [stock, setStock] = useState("");
  const [ingPrice, setIngPrice] = useState("");

  // Costing Analysis States
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [recipeQuantity, setRecipeQuantity] = useState("");
  const [recipeInputUnit, setRecipeInputUnit] = useState("");
  const [productRecipe, setProductRecipe] = useState([]);
  const [costingAnalysis, setCostingAnalysis] = useState([]);

  // Profit Insights
  const [insights, setInsights] = useState({
    activeShift: null,
    topProfitable: null,
    leastProfitable: null,
    averageMargin: 0,
    totalProfit: 0,
    totalRevenue: 0,
    dailyRevenue: []
  });

  /* ================= HELPERS ================= */
  const getIngredientById = (id) => {
    return ingredients.find((i) => String(i.id) === String(id));
  };

  const getRecipeUnitOptions = (ingredientUnit) => {
    if (ingredientUnit === "L" || ingredientUnit === "mL") return ["mL", "L"];
    if (ingredientUnit === "kg" || ingredientUnit === "g") return ["g", "kg"];
    return ["pcs"];
  };

  const convertToBaseUnit = (quantity, fromUnit, toUnit) => {
    const qty = Number(quantity);

    if (isNaN(qty)) return null;
    if (fromUnit === toUnit) return qty;

    // volume
    if (fromUnit === "mL" && toUnit === "L") return qty / 1000;
    if (fromUnit === "L" && toUnit === "mL") return qty * 1000;

    // weight
    if (fromUnit === "g" && toUnit === "kg") return qty / 1000;
    if (fromUnit === "kg" && toUnit === "g") return qty * 1000;

    return null;
  };

  const getStockStatus = (stock, unit) => {
    const value = Number(stock);

    if (unit === "pcs") {
      if (value <= 5) return { label: "Low", color: "#b3261e", bg: "#fdecea" };
      if (value <= 10) return { label: "Medium", color: "#b26a00", bg: "#fff4db" };
      return { label: "Good", color: "#2e7d32", bg: "#eaf7ee" };
    }

    if (unit === "mL" || unit === "g") {
      if (value <= 200) return { label: "Low", color: "#b3261e", bg: "#fdecea" };
      if (value <= 500) return { label: "Medium", color: "#b26a00", bg: "#fff4db" };
      return { label: "Good", color: "#2e7d32", bg: "#eaf7ee" };
    }

    if (unit === "L" || unit === "kg") {
      if (value <= 1) return { label: "Low", color: "#b3261e", bg: "#fdecea" };
      if (value <= 3) return { label: "Medium", color: "#b26a00", bg: "#fff4db" };
      return { label: "Good", color: "#2e7d32", bg: "#eaf7ee" };
    }

    return { label: "Good", color: "#2e7d32", bg: "#eaf7ee" };
  };

  const profitInsights = (() => {
    if (!costingAnalysis.length) {
      return {
        topProfit: null,
        lowProfit: null,
        topMargin: null,
        avgProfit: 0,
        avgMargin: 0
      };
    }

    const topProfit = [...costingAnalysis].sort((a, b) => b.profit - a.profit)[0];
    const lowProfit = [...costingAnalysis].sort((a, b) => a.profit - b.profit)[0];
    const topMargin = [...costingAnalysis].sort((a, b) => b.margin - a.margin)[0];

    const avgProfit =
      costingAnalysis.reduce((sum, item) => sum + Number(item.profit || 0), 0) /
      costingAnalysis.length;

    const avgMargin =
      costingAnalysis.reduce((sum, item) => sum + Number(item.margin || 0), 0) /
      costingAnalysis.length;

    return {
      topProfit,
      lowProfit,
      topMargin,
      avgProfit,
      avgMargin
    };
  })();

  /* ================= FETCH LOGIC ================= */
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${API}/api/ingredients`);
      const data = await res.json();
      setIngredients(data);
    } catch (err) {
      console.error("Fetch ingredients error:", err);
    }
  };

  const fetchProductRecipe = async (productId) => {
    if (!productId) {
      setProductRecipe([]);
      return;
    }

    try {
      const res = await fetch(`${API}/api/products/${productId}/ingredients`);
      const data = await res.json();
      setProductRecipe(data);
    } catch (err) {
      console.error("Fetch product recipe error:", err);
    }
  };

  const fetchCostingAnalysis = async () => {
    try {
      const res = await fetch(`${API}/api/costing-analysis`);
      const data = await res.json();
      setCostingAnalysis(data);
    } catch (err) {
      console.error("Fetch costing analysis error:", err);
    }
  };

  const fetchProfitInsights = async () => {
    try {
      const res = await fetch(`${API}/api/admin/profit-insights`);
      const data = await res.json();
      setInsights({
        activeShift: data.activeShift || null,
        topProfitable: data.topProfitable || null,
        leastProfitable: data.leastProfitable || null,
        averageMargin: data.averageMargin || 0,
        totalProfit: data.totalProfit || 0,
        totalRevenue: data.totalRevenue || 0,
        dailyRevenue: data.dailyRevenue || []
      });
    } catch (err) {
      console.error("Fetch profit insights error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchIngredients();
    fetchCostingAnalysis();
    fetchProfitInsights();
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

    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      setName("");
      setCategory("");
      setPrice("");
      setImage(null);
      fetchProducts();
      fetchCostingAnalysis();
      fetchProfitInsights();
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
      fetchCostingAnalysis();
      fetchProfitInsights();

      if (String(selectedProductId) === String(id)) {
        setSelectedProductId("");
        setProductRecipe([]);
      }
    }
  };

  /* ================= INGREDIENT ACTIONS ================= */
  const addIngredient = async () => {
    if (!ingredientName || !ingUnit || !stock || !ingPrice) {
      return alert("Fill all fields");
    }

    try {
      const res = await fetch(`${API}/api/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ingredientName,
          unit: ingUnit,
          stock: Number(stock),
          price: Number(ingPrice)
        })
      });

      if (res.ok) {
        setIngredientName("");
        setIngUnit("pcs");
        setStock("");
        setIngPrice("");
        fetchIngredients();
        fetchCostingAnalysis();
        fetchProfitInsights();
      }
    } catch (err) {
      console.error("Add ingredient error:", err);
    }
  };

  const updateStock = async (id, change, unit) => {
    let adjustedChange = change;

    if (unit === "mL" || unit === "g") adjustedChange = change * 10;
    if (unit === "L" || unit === "kg") adjustedChange = change * 0.1;
    if (unit === "pcs") adjustedChange = change;

    try {
      const res = await fetch(`${API}/api/ingredients/${id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change: adjustedChange })
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
      fetchCostingAnalysis();
      fetchProfitInsights();

      if (selectedProductId) {
        fetchProductRecipe(selectedProductId);
      }
    }
  };

  /* ================= COSTING ACTIONS ================= */
  const addRecipeIngredient = async () => {
    if (!selectedProductId || !selectedIngredientId || !recipeQuantity || !recipeInputUnit) {
      return alert("Select product, ingredient, quantity, and unit");
    }

    try {
      const selectedIngredient = getIngredientById(selectedIngredientId);

      if (!selectedIngredient) {
        return alert("Invalid ingredient selected");
      }

      const existing = productRecipe.find(
        (item) => String(item.ingredient_id) === String(selectedIngredientId)
      );

      if (existing) {
        return alert("This ingredient is already in the recipe. Delete it first if you want to change it.");
      }

      const convertedQuantity = convertToBaseUnit(
        recipeQuantity,
        recipeInputUnit,
        selectedIngredient.unit
      );

      if (convertedQuantity === null) {
        return alert(`Cannot convert ${recipeInputUnit} to ${selectedIngredient.unit}`);
      }

      const res = await fetch(`${API}/api/products/${selectedProductId}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_id: selectedIngredientId,
          quantity: convertedQuantity
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message || "Failed to add ingredient to recipe");
      }

      setSelectedIngredientId("");
      setRecipeQuantity("");
      setRecipeInputUnit("");
      fetchProductRecipe(selectedProductId);
      fetchCostingAnalysis();
      fetchProfitInsights();
    } catch (err) {
      console.error("Add recipe ingredient error:", err);
    }
  };

  const deleteRecipeIngredient = async (id) => {
    try {
      const res = await fetch(`${API}/api/product-ingredients/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        fetchProductRecipe(selectedProductId);
        fetchCostingAnalysis();
        fetchProfitInsights();
      }
    } catch (err) {
      console.error("Delete recipe ingredient error:", err);
    }
  };

  return (
    <div className="admin-container">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your inventory and products seamlessly.</p>

          <nav className="tab-navigation">
            <button
              onClick={async () => {
                const res = await fetch("http://localhost:5000/api/orders", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    items: [{ product_id: 18, quantity: 1 }]
                  })
                });

                const data = await res.json();
                alert(data.message);

                fetchIngredients();
                fetchCostingAnalysis();
                fetchProfitInsights();
              }}
            >
              Test Order
            </button>

            <button
              onClick={newShift}
              style={{
                background: "#6b4f3a",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "700"
              }}
            >
              New Shift
            </button>

            <button
              className={tab === "products" ? "nav-btn active" : "nav-btn"}
              onClick={() => setTab("products")}
            >
              <span className="icon">☕</span> Products
            </button>
            <button
              className={tab === "ingredients" ? "nav-btn active" : "nav-btn"}
              onClick={() => setTab("ingredients")}
            >
              <span className="icon">🌿</span> Ingredients
            </button>
            <button
              className={tab === "costing" ? "nav-btn active" : "nav-btn"}
              onClick={() => setTab("costing")}
            >
              <span className="icon">📊</span> Cost Analysis
            </button>
          </nav>
        </header>

        <div className="glass-card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2>Profit Insights Dashboard</h2>
          </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "20px"
  }}
>
            <div style={{ padding: "16px", border: "1px solid #000", borderRadius: "12px", background: "#fbf9f7", minWidth: "180px", textAlign: "center"}}>
              <h4>Active Shift</h4>
              <p>{insights.activeShift?.name || "No Active Shift"}</p>
            </div>


            <div
              style={{
                padding: "16px",
                border: "1px solid #000",
                borderRadius: "12px",
                background: "#eef4ff",
                minWidth: "180px",
                textAlign: "center"
              }}
            >
              <h4>Top Profitable Product</h4>
              <p>{insights.topProfitable?.name || "N/A"}</p>
              <strong style={{ color: "#1565c0" }}>
                ₱{Number(insights.topProfitable?.total_profit || 0).toFixed(2)}
              </strong>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1px solid #000",
                borderRadius: "12px",
                background: "#fdecea",
                minWidth: "180px",
                textAlign: "center"

              }}
            >
              <h4>Least Profitable Product</h4>
              <p>{insights.leastProfitable?.name || "N/A"}</p>
              <strong style={{ color: "#b3261e" }}>
                ₱{Number(insights.leastProfitable?.total_profit || 0).toFixed(2)}
              </strong>
            </div>
                        <div
              style={{
                padding: "16px",
                border: "1px solid #000",
                borderRadius: "12px",
                background: "#fbf9f7",
                minWidth: "180px",
                textAlign: "center"
              }}
            >
              <h4>Shift Revenue</h4>
              <strong>₱{Number(insights.totalRevenue || 0).toFixed(2)}</strong>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1px solid #000",
                borderRadius: "12px",
                background: "#fbf9f7",
                minWidth: "180px",
                textAlign: "center"
              }}
            >
              <h4>Average Margin</h4>
              <p>{Number(insights.averageMargin || 0).toFixed(2)}%</p>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1px solid #000",
                borderRadius: "12px",
                background: "#eaf7ee",
                minWidth: "180px",
                textAlign: "center"
              }}
            >
              <h4>Total Profit</h4>
              <strong style={{ color: "#2e7d32" }}>
                ₱{Number(insights.totalProfit || 0).toFixed(2)}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h3>Total Revenue History Per Day</h3>

            {insights.dailyRevenue.length === 0 ? (
              <p>No revenue data yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="black-border-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.dailyRevenue.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(item.day).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </td>
                        <td className="price-tag">
                          ₱{Number(item.revenue).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <section className="main-section">
          {tab === "products" ? (
            <div className="glass-card">
              <div className="card-header"><h2>Product Management</h2></div>

              <div className="form-group">
                <input
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

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

                <input
                  placeholder="Price (₱)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="prod-img"
                    className="file-input"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <label htmlFor="prod-img">
                    {image ? "Image Selected" : "Choose Image"}
                  </label>
                </div>

                <button className="btn-primary" onClick={addProduct}>
                  Add Product
                </button>
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
                        <td>
                          <div className="img-center-wrapper">
                            <img
                              src={p.image ? API + p.image : "/placeholder.png"}
                              className="table-img"
                              alt={p.name}
                            />
                          </div>
                        </td>
                        <td className="font-bold">{p.name}</td>
                        <td>{p.category}</td>
                        <td className="price-tag">₱{Number(p.price).toLocaleString()}</td>
                        <td>
                          <button className="btn-danger" onClick={() => deleteProduct(p.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan="5">No products yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : tab === "ingredients" ? (
            <div className="glass-card">
              <div className="card-header"><h2>Ingredients Inventory</h2></div>

              <div className="form-group">
                <div className="alert-summary">
                  <h3>Low Stock Alerts</h3>
                  <p>
                    {ingredients.filter((i) => getStockStatus(i.stock, i.unit).label === "Low").length} low stock item(s)
                  </p>
                </div>

                <input
                  placeholder="Ingredient Name"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                />

                <select value={ingUnit} onChange={(e) => setIngUnit(e.target.value)}>
                  <option value="L">L</option>
                  <option value="mL">mL</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                </select>

                <input
                  placeholder={`Stock Qty (${ingUnit})`}
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />

                <input
                  placeholder={`Price per ${ingUnit} (₱)`}
                  type="number"
                  value={ingPrice}
                  onChange={(e) => setIngPrice(e.target.value)}
                />

                <button className="btn-primary" onClick={addIngredient}>
                  Add Item
                </button>
              </div>

              <div className="table-wrapper">
                <table className="black-border-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Unit</th>
                      <th>Current Stock</th>
                      <th>Status</th>
                      <th>Unit Price</th>
                      <th>Total Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((i) => {
                      const stockStatus = getStockStatus(i.stock, i.unit);

                      return (
                        <tr key={i.id}>
                          <td className="font-bold">{i.name}</td>
                          <td>{i.unit}</td>

                          <td>
                            <div className="stock-with-unit">
                              <div className="stock-control">
                                <button
                                  onClick={() => updateStock(i.id, -10, i.unit)}
                                  className="stock-btn"
                                >
                                  -
                                </button>
                                <span className="stock-val">{i.stock}</span>
                                <button
                                  onClick={() => updateStock(i.id, 10, i.unit)}
                                  className="stock-btn"
                                >
                                  +
                                </button>
                              </div>
                              <span className="unit-label">{i.unit}</span>
                            </div>
                          </td>

                          <td>
                            <span
                              className="status-badge"
                              style={{
                                color: stockStatus.color,
                                backgroundColor: stockStatus.bg
                              }}
                            >
                              {stockStatus.label}
                            </span>
                          </td>

                          <td className="price-tag">₱{i.price} / {i.unit}</td>
                          <td className="total-val">₱{(i.stock * i.price).toLocaleString()}</td>

                          <td>
                            <button className="btn-danger" onClick={() => deleteIngredient(i.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {ingredients.length === 0 && (
                      <tr>
                        <td colSpan="7">No ingredients yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="inventory-footer">
                <h3>
                  Total Inventory Value{" "}
                  <span>
                    ₱{ingredients.reduce((sum, i) => sum + i.stock * i.price, 0).toLocaleString()}
                  </span>
                </h3>
              </div>
            </div>
          ) : (
            <div className="glass-card">
              <div className="card-header"><h2>Cost Analysis</h2></div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ padding: "16px", border: "1px solid #000", borderRadius: "12px", background: "#fbf9f7" }}>
                  <h4>Highest Recipe Profit</h4>
                  <p>{profitInsights.topProfit?.name || "N/A"}</p>
                  <strong>₱{Number(profitInsights.topProfit?.profit || 0).toFixed(2)}</strong>
                </div>

                <div style={{ padding: "16px", border: "1px solid #000", borderRadius: "12px", background: "#fbf9f7" }}>
                  <h4>Lowest Recipe Profit</h4>
                  <p>{profitInsights.lowProfit?.name || "N/A"}</p>
                  <strong>₱{Number(profitInsights.lowProfit?.profit || 0).toFixed(2)}</strong>
                </div>

                <div style={{ padding: "16px", border: "1px solid #000", borderRadius: "12px", background: "#fbf9f7" }}>
                  <h4>Best Margin Product</h4>
                  <p>{profitInsights.topMargin?.name || "N/A"}</p>
                  <strong>{Number(profitInsights.topMargin?.margin || 0).toFixed(2)}%</strong>
                </div>

                <div style={{ padding: "16px", border: "1px solid #000", borderRadius: "12px", background: "#fbf9f7" }}>
                  <h4>Average Recipe Margin</h4>
                  <strong>{Number(profitInsights.avgMargin || 0).toFixed(2)}%</strong>
                </div>
              </div>

              <div className="form-group">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setSelectedIngredientId("");
                    setRecipeQuantity("");
                    setRecipeInputUnit("");
                    fetchProductRecipe(e.target.value);
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductId && (
                <>
                  <div className="card-header" style={{ marginBottom: "1rem" }}>
                    <h2>Edit Recipe</h2>
                  </div>

                  <div className="form-group">
                    <select
                      value={selectedIngredientId}
                      onChange={(e) => {
                        const ingredientId = e.target.value;
                        setSelectedIngredientId(ingredientId);
                        setRecipeQuantity("");
                        const ingredient = getIngredientById(ingredientId);
                        if (ingredient) {
                          const options = getRecipeUnitOptions(ingredient.unit);
                          setRecipeInputUnit(options[0]);
                        } else {
                          setRecipeInputUnit("");
                        }
                      }}
                    >
                      <option value="">Select Ingredient</option>
                      {ingredients.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Quantity Used"
                      value={recipeQuantity}
                      onChange={(e) => setRecipeQuantity(e.target.value)}
                    />

                    <select
                      value={recipeInputUnit}
                      onChange={(e) => setRecipeInputUnit(e.target.value)}
                      disabled={!selectedIngredientId}
                    >
                      {!selectedIngredientId ? (
                        <option value="">Select Unit</option>
                      ) : (
                        getRecipeUnitOptions(getIngredientById(selectedIngredientId)?.unit || "pcs").map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))
                      )}
                    </select>

                    <button className="btn-primary" onClick={addRecipeIngredient}>
                      Add to Recipe
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ marginBottom: "2rem" }}>
                    <table className="black-border-table">
                      <thead>
                        <tr>
                          <th>Ingredient</th>
                          <th>Base Unit</th>
                          <th>Unit Cost</th>
                          <th>Quantity Used</th>
                          <th>Cost</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productRecipe.map((r) => (
                          <tr key={r.id}>
                            <td>{r.ingredient_name}</td>
                            <td>{r.ingredient_unit}</td>
                            <td>₱{Number(r.ingredient_price).toLocaleString()} / {r.ingredient_unit}</td>
                            <td>{r.quantity} {r.ingredient_unit}</td>
                            <td>₱{(Number(r.quantity) * Number(r.ingredient_price)).toLocaleString()}</td>
                            <td>
                              <button
                                className="btn-danger"
                                onClick={() => deleteRecipeIngredient(r.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {productRecipe.length === 0 && (
                          <tr>
                            <td colSpan="6">No recipe ingredients yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="table-wrapper">
                <table className="black-border-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Selling Price</th>
                      <th>Total Cost</th>
                      <th>Profit</th>
                      <th>Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costingAnalysis.map((item) => (
                      <tr key={item.id}>
                        <td className="font-bold">{item.name}</td>
                        <td>{item.category}</td>
                        <td>₱{Number(item.selling_price).toLocaleString()}</td>
                        <td>₱{Number(item.total_cost).toLocaleString()}</td>
                        <td className="price-tag">₱{Number(item.profit).toLocaleString()}</td>
                        <td className="total-val">{Number(item.margin).toFixed(2)}%</td>
                      </tr>
                    ))}
                    {costingAnalysis.length === 0 && (
                      <tr>
                        <td colSpan="6">No costing analysis available yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .alert-summary {
          margin-bottom: 1.5rem;
          padding: 1rem 1.2rem;
          border: 1px solid #000;
          border-radius: 12px;
          background: #fff8f2;
        }

        .alert-summary h3 {
          margin: 0 0 6px 0;
          color: #6b4f3a;
        }

        .alert-summary p {
          margin: 0;
          font-weight: 700;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .admin-container {
          background-color: #fff7f0;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          color: #4a3728;
        }

        .admin-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-header h1 {
          font-size: 2.4rem;
          color: #6b4f3a;
          margin: 0;
          font-weight: 800;
        }

        .tab-navigation {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .nav-btn {
          padding: 10px 24px;
          border: 2px solid #6b4f3a;
          border-radius: 50px;
          background: rgba(255,255,255,0.8);
          cursor: pointer;
          font-weight: 700;
          color: #6b4f3a;
        }

        .nav-btn.active {
          background: #6b4f3a;
          color: #fff;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid #000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .form-group {
          display: flex;
          gap: 10px;
          margin-bottom: 2rem;
          padding: 1.2rem;
          background: #fbf9f7;
          border-radius: 12px;
          border: 1px solid #000;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        input, select {
          padding: 10px;
          border: 1px solid #000;
          border-radius: 8px;
          width: 160px;
        }

        .btn-primary {
          background: #6b4f3a;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .black-border-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
        }

        .black-border-table th,
        .black-border-table td {
          border: 1px solid #000;
          padding: 12px;
          text-align: center;
        }

        .black-border-table th {
          background: #f2ede9;
          font-size: 0.85rem;
        }

        .table-img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #000;
        }

        .img-center-wrapper {
          display: flex;
          justify-content: center;
        }

        .font-bold {
          font-weight: 700;
          color: #4a3728;
        }

        .price-tag {
          font-weight: 700;
          color: #2e7d32;
        }

        .total-val {
          font-weight: 800;
          color: #6b4f3a;
        }

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

        .stock-with-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .unit-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #6b4f3a;
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

        .stock-val {
          min-width: 24px;
          font-weight: 700;
        }

        .inventory-footer {
          margin-top: 1.5rem;
          text-align: right;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .inventory-footer span {
          color: #2e7d32;
        }

        .file-input {
          display: none;
        }

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