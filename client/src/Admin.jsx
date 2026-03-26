import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { db } from "./firebase";
import { logoutUser } from "./auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";

export default function Admin() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [voidedOrders, setVoidedOrders] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const [ingredientMode, setIngredientMode] = useState("new");
  const [ingredientName, setIngredientName] = useState("");
  const [ingUnit, setIngUnit] = useState("pcs");
  const [stock, setStock] = useState("");
  const [ingPrice, setIngPrice] = useState("");

  const [restockIngredientId, setRestockIngredientId] = useState("");
  const [restockAmount, setRestockAmount] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [recipeQuantity, setRecipeQuantity] = useState("");
  const [recipeInputUnit, setRecipeInputUnit] = useState("");
  const [productRecipe, setProductRecipe] = useState([]);

  const categories = [
    "Coffee Based",
    "Non-Coffee Based",
    "Matcha Series",
    "Chocolate Series",
    "Barista's Choice",
    "Soda",
    "Dirty Soda"
  ];

  const activeShift = shifts.find((s) => s.isActive) || null;

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
    if (fromUnit === "mL" && toUnit === "L") return qty / 1000;
    if (fromUnit === "L" && toUnit === "mL") return qty * 1000;
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

  const getItemStatus = (item) => item.itemStatus || "pending";

  const getItemStatusStyle = (status) => {
    if (status === "done") return { color: "#2e7d32", bg: "#eaf7ee", label: "Done" };
    if (status === "void") return { color: "#b3261e", bg: "#fdecea", label: "Void" };
    return { color: "#8a6c54", bg: "#f4eee9", label: "Pending" };
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout.");
    }
  };

  useEffect(() => {
    const unsubProducts = onSnapshot(
      query(collection(db, "products"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubIngredients = onSnapshot(
      query(collection(db, "ingredients"), orderBy("name", "asc")),
      (snapshot) => {
        setIngredients(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubRecipes = onSnapshot(collection(db, "recipes"), (snapshot) => {
      setRecipes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubPendingOrders = onSnapshot(
      query(collection(db, "orders"), where("status", "==", "pending")),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aMs = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const bMs = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
          return bMs - aMs;
        });
        setPendingOrders(data);
      }
    );

    const unsubCompletedOrders = onSnapshot(
      query(collection(db, "orders"), where("status", "==", "completed")),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aMs = a.completedAt?.seconds ? a.completedAt.seconds * 1000 : 0;
          const bMs = b.completedAt?.seconds ? b.completedAt.seconds * 1000 : 0;
          return bMs - aMs;
        });
        setCompletedOrders(data);
      }
    );

    const unsubVoidedOrders = onSnapshot(
      query(collection(db, "orders"), where("status", "==", "voided")),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVoidedOrders(data);
      }
    );

    const unsubShifts = onSnapshot(
      query(collection(db, "shifts"), orderBy("startedAt", "desc")),
      (snapshot) => {
        setShifts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubProducts();
      unsubIngredients();
      unsubRecipes();
      unsubPendingOrders();
      unsubCompletedOrders();
      unsubVoidedOrders();
      unsubShifts();
    };
  }, []);

  useEffect(() => {
    if (!selectedProductId) {
      setProductRecipe([]);
      return;
    }

    const selectedRecipes = recipes
      .filter((r) => String(r.productId) === String(selectedProductId))
      .map((r) => {
        const ingredient = ingredients.find(
          (i) => String(i.id) === String(r.ingredientId)
        );

        return {
          id: r.id,
          ingredient_id: r.ingredientId,
          ingredient_name: ingredient?.name || "Unknown",
          ingredient_unit: ingredient?.unit || "",
          ingredient_price: Number(ingredient?.price || 0),
          quantity: Number(r.quantity || 0)
        };
      });

    setProductRecipe(selectedRecipes);
  }, [selectedProductId, recipes, ingredients]);

  const costingAnalysis = useMemo(() => {
    return products.map((product) => {
      const recipeRows = recipes.filter(
        (r) => String(r.productId) === String(product.id)
      );

      const totalCost = recipeRows.reduce((sum, r) => {
        const ingredient = ingredients.find(
          (i) => String(i.id) === String(r.ingredientId)
        );
        if (!ingredient) return sum;
        return sum + Number(r.quantity || 0) * Number(ingredient.price || 0);
      }, 0);

      const sellingPrice = Number(product.price || 0);
      const profit = sellingPrice - totalCost;
      const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        selling_price: sellingPrice,
        total_cost: totalCost,
        profit,
        margin
      };
    });
  }, [products, recipes, ingredients]);

  const profitInsights = useMemo(() => {
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

    return { topProfit, lowProfit, topMargin, avgProfit, avgMargin };
  }, [costingAnalysis]);

  const insights = useMemo(() => {
    const itemStats = {};

    completedOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (getItemStatus(item) === "void") return;

        const key = item.productId || item.name;
        if (!itemStats[key]) {
          itemStats[key] = { name: item.name || "Unknown", total_profit: 0, total_revenue: 0 };
        }

        const itemSubtotal = Number(item.subtotal || 0);
        const itemCost = Number(item.cost || 0);
        const qty = Number(item.quantity || 0);

        itemStats[key].total_revenue += itemSubtotal;
        itemStats[key].total_profit += itemSubtotal - itemCost * qty;
      });
    });

    const itemList = Object.values(itemStats);

    const topProfitable =
      itemList.length > 0
        ? [...itemList].sort((a, b) => b.total_profit - a.total_profit)[0]
        : null;

    const leastProfitable =
      itemList.length > 0
        ? [...itemList].sort((a, b) => a.total_profit - b.total_profit)[0]
        : null;

    let totalRevenue = 0;
    let totalProfit = 0;

    completedOrders.forEach((order) => {
      totalRevenue += Number(order.total || 0);

      (order.items || []).forEach((item) => {
        if (getItemStatus(item) === "void") return;
        const itemSubtotal = Number(item.subtotal || 0);
        const itemCost = Number(item.cost || 0);
        const qty = Number(item.quantity || 0);
        totalProfit += itemSubtotal - itemCost * qty;
      });
    });

    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const revenueMap = {};
    completedOrders.forEach((order) => {
      const dateObj = order.completedAt?.seconds
        ? new Date(order.completedAt.seconds * 1000)
        : order.createdAt?.seconds
        ? new Date(order.createdAt.seconds * 1000)
        : null;

      if (!dateObj) return;

      const key = dateObj.toISOString().slice(0, 10);
      revenueMap[key] = (revenueMap[key] || 0) + Number(order.total || 0);
    });

    const dailyRevenue = Object.entries(revenueMap)
      .map(([day, revenue]) => ({ day, revenue }))
      .sort((a, b) => new Date(b.day) - new Date(a.day));

    return {
      activeShift,
      topProfitable,
      leastProfitable,
      averageMargin,
      totalProfit,
      totalRevenue,
      dailyRevenue
    };
  }, [completedOrders, activeShift]);

  const newShift = async () => {
    if (!window.confirm("Start a new shift?")) return;

    try {
      const batch = writeBatch(db);

      shifts.forEach((shift) => {
        if (shift.isActive) {
          batch.update(doc(db, "shifts", shift.id), {
            isActive: false,
            endedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();

      await addDoc(collection(db, "shifts"), {
        name: `Shift ${shifts.length + 1}`,
        isActive: true,
        startedAt: serverTimestamp()
      });

      alert("New shift started.");
    } catch (err) {
      console.error(err);
      alert("Failed to start new shift.");
    }
  };

  const addProduct = async () => {
    if (!name.trim() || !category || !price) return alert("Fill in name, category, and price");

    try {
      let imageUrl = "";
      if (image) imageUrl = await uploadToCloudinary(image);

      await addDoc(collection(db, "products"), {
        name: name.trim(),
        category,
        price: Number(price),
        imageUrl,
        createdAt: serverTimestamp()
      });

      setName("");
      setCategory("");
      setPrice("");
      setImage(null);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add product.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      const recipeDocs = recipes.filter((r) => String(r.productId) === String(id));
      await Promise.all(recipeDocs.map((r) => deleteDoc(doc(db, "recipes", r.id))));
      if (String(selectedProductId) === String(id)) {
        setSelectedProductId("");
        setProductRecipe([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  const addIngredient = async () => {
    if (!ingredientName || !ingUnit || !stock || !ingPrice) return alert("Fill all fields");

    try {
      await addDoc(collection(db, "ingredients"), {
        name: ingredientName.trim(),
        unit: ingUnit,
        stock: Number(stock),
        price: Number(ingPrice),
        createdAt: serverTimestamp()
      });

      setIngredientName("");
      setIngUnit("pcs");
      setStock("");
      setIngPrice("");
    } catch (err) {
      console.error(err);
      alert("Failed to add ingredient.");
    }
  };

  const restockIngredient = async () => {
    if (!restockIngredientId || !restockAmount) return alert("Select ingredient and amount.");

    const ingredient = getIngredientById(restockIngredientId);
    if (!ingredient) return alert("Ingredient not found.");

    const addAmount = Number(restockAmount);
    if (isNaN(addAmount) || addAmount <= 0) return alert("Enter a valid amount.");

    try {
      await updateDoc(doc(db, "ingredients", restockIngredientId), {
        stock: Number(ingredient.stock || 0) + addAmount
      });

      setRestockIngredientId("");
      setRestockAmount("");
      alert("Ingredient stock updated.");
    } catch (err) {
      console.error(err);
      alert("Failed to update stock.");
    }
  };

  const deleteIngredient = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;

    try {
      await deleteDoc(doc(db, "ingredients", id));
      const recipeDocs = recipes.filter((r) => String(r.ingredientId) === String(id));
      await Promise.all(recipeDocs.map((r) => deleteDoc(doc(db, "recipes", r.id))));
    } catch (err) {
      console.error(err);
      alert("Failed to delete ingredient.");
    }
  };

  const addRecipeIngredient = async () => {
    if (!selectedProductId || !selectedIngredientId || !recipeQuantity || !recipeInputUnit) {
      return alert("Select product, ingredient, quantity, and unit");
    }

    try {
      const selectedIngredient = getIngredientById(selectedIngredientId);
      if (!selectedIngredient) return alert("Invalid ingredient selected");

      const existing = productRecipe.find(
        (item) => String(item.ingredient_id) === String(selectedIngredientId)
      );
      if (existing) return alert("This ingredient is already in the recipe.");

      const convertedQuantity = convertToBaseUnit(
        recipeQuantity,
        recipeInputUnit,
        selectedIngredient.unit
      );

      if (convertedQuantity === null) {
        return alert(`Cannot convert ${recipeInputUnit} to ${selectedIngredient.unit}`);
      }

      await addDoc(collection(db, "recipes"), {
        productId: selectedProductId,
        ingredientId: selectedIngredientId,
        quantity: Number(convertedQuantity),
        createdAt: serverTimestamp()
      });

      setSelectedIngredientId("");
      setRecipeQuantity("");
      setRecipeInputUnit("");
    } catch (err) {
      console.error(err);
      alert("Failed to add recipe ingredient.");
    }
  };

  const deleteRecipeIngredient = async (id) => {
    try {
      await deleteDoc(doc(db, "recipes", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete recipe ingredient.");
    }
  };

  const updateOrderItemStatus = async (orderId, itemIndex, newStatus) => {
    try {
      const order = pendingOrders.find((o) => String(o.id) === String(orderId));
      if (!order) return alert("Order not found.");

      const updatedItems = (order.items || []).map((item, index) =>
        index === itemIndex ? { ...item, itemStatus: newStatus } : item
      );

      await updateDoc(doc(db, "orders", orderId), { items: updatedItems });
    } catch (err) {
      console.error(err);
      alert("Failed to update item status.");
    }
  };

  const completeOrder = async (orderId) => {
    if (!window.confirm(`Complete order #${orderId.slice(0, 6)}?`)) return;

    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);

        if (!orderSnap.exists()) throw new Error("Order not found.");

        const order = orderSnap.data();
        if (order.status !== "pending") throw new Error("Order is no longer pending.");

        const items = order.items || [];
        if (items.length === 0) throw new Error("Order has no items.");

        const hasPendingItems = items.some((item) => getItemStatus(item) === "pending");
        if (hasPendingItems) {
          throw new Error("All items must be marked Done or Void before completing the order.");
        }

        const doneItems = items.filter((item) => getItemStatus(item) === "done");
        const ingredientUsageMap = {};
        const enrichedItems = [];

        for (const item of doneItems) {
          const productRecipes = recipes.filter(
            (r) => String(r.productId) === String(item.productId)
          );
          if (productRecipes.length === 0) throw new Error(`No recipe found for ${item.name}.`);

          const productCosting = costingAnalysis.find(
            (c) => String(c.id) === String(item.productId)
          );

          enrichedItems.push({
            ...item,
            cost: Number(productCosting?.total_cost || 0),
            subtotal:
              Number(item.subtotal || 0) ||
              Number(item.price || 0) * Number(item.quantity || 0)
          });

          for (const recipe of productRecipes) {
            const ingredientId = String(recipe.ingredientId);
            const requiredQty = Number(recipe.quantity || 0) * Number(item.quantity || 0);
            ingredientUsageMap[ingredientId] =
              (ingredientUsageMap[ingredientId] || 0) + requiredQty;
          }
        }

        const voidItems = items
          .filter((item) => getItemStatus(item) === "void")
          .map((item) => ({
            ...item,
            cost: 0,
            subtotal:
              Number(item.subtotal || 0) ||
              Number(item.price || 0) * Number(item.quantity || 0)
          }));

        const ingredientDocs = {};
        for (const ingredientId of Object.keys(ingredientUsageMap)) {
          const ingredientRef = doc(db, "ingredients", ingredientId);
          const ingredientSnap = await transaction.get(ingredientRef);

          if (!ingredientSnap.exists()) {
            throw new Error("An ingredient in this recipe no longer exists.");
          }

          ingredientDocs[ingredientId] = {
            ref: ingredientRef,
            data: ingredientSnap.data()
          };
        }

        for (const ingredientId of Object.keys(ingredientUsageMap)) {
          const ingredientData = ingredientDocs[ingredientId].data;
          const currentStock = Number(ingredientData.stock || 0);
          const neededStock = Number(ingredientUsageMap[ingredientId] || 0);

          if (currentStock < neededStock) {
            throw new Error(`Not enough stock for ${ingredientData.name}.`);
          }
        }

        for (const ingredientId of Object.keys(ingredientUsageMap)) {
          const ingredientRef = ingredientDocs[ingredientId].ref;
          const ingredientData = ingredientDocs[ingredientId].data;
          const currentStock = Number(ingredientData.stock || 0);
          const neededStock = Number(ingredientUsageMap[ingredientId] || 0);

          transaction.update(ingredientRef, {
            stock: currentStock - neededStock
          });
        }

        const finalItems = [...enrichedItems, ...voidItems];
        const finalTotal = enrichedItems.reduce(
          (sum, item) => sum + Number(item.subtotal || 0),
          0
        );

        transaction.update(orderRef, {
          status: "completed",
          completedAt: serverTimestamp(),
          shiftId: activeShift?.id || null,
          shiftName: activeShift?.name || null,
          total: finalTotal,
          items: finalItems
        });
      });

      alert("Order completed.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to complete order.");
    }
  };

  const voidOrder = async (orderId) => {
    if (!window.confirm(`Void order #${orderId.slice(0, 6)}?`)) return;

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "voided",
        voidedAt: serverTimestamp()
      });

      alert("Order voided.");
    } catch (err) {
      console.error(err);
      alert("Failed to void order.");
    }
  };

  return (
    <div className="admin-container">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-topbar">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage your inventory, orders, and products seamlessly.</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <nav className="tab-navigation">
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

            <button className={tab === "dashboard" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("dashboard")}>
              Dashboard
            </button>
            <button className={tab === "products" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("products")}>
              Products
            </button>
            <button className={tab === "ingredients" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("ingredients")}>
              Ingredients
            </button>
            <button className={tab === "costing" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("costing")}>
              Cost Analysis
            </button>
            <button className={tab === "history" ? "nav-btn active" : "nav-btn"} onClick={() => setTab("history")}>
              Sales History
            </button>
          </nav>
        </header>

        <section className="main-section">
          {tab === "dashboard" && (
            <>
              <div className="glass-card" style={{ marginBottom: "20px" }}>
                <div className="card-header"><h2>Profit Insights Dashboard</h2></div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginBottom: "20px" }}>
                  <div style={dashboardCard}>
                    <h4>Active Shift</h4>
                    <p>{insights.activeShift?.name || "No Active Shift"}</p>
                  </div>
                  <div style={dashboardCard}>
                    <h4>Shift Revenue</h4>
                    <strong>₱{Number(insights.totalRevenue || 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ ...dashboardCard, background: "#eef4ff" }}>
                    <h4>Top Profitable</h4>
                    <p>{insights.topProfitable?.name || "N/A"}</p>
                    <strong style={{ color: "#1565c0" }}>₱{Number(insights.topProfitable?.total_profit || 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ ...dashboardCard, background: "#fdecea" }}>
                    <h4>Least Profitable</h4>
                    <p>{insights.leastProfitable?.name || "N/A"}</p>
                    <strong style={{ color: "#b3261e" }}>₱{Number(insights.leastProfitable?.total_profit || 0).toFixed(2)}</strong>
                  </div>
                  <div style={dashboardCard}>
                    <h4>Average Margin</h4>
                    <p>{Number(insights.averageMargin || 0).toFixed(2)}%</p>
                  </div>
                  <div style={{ ...dashboardCard, background: "#eaf7ee" }}>
                    <h4>Total Profit</h4>
                    <strong style={{ color: "#2e7d32" }}>₱{Number(insights.totalProfit || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <div className="card-header"><h2>Pending Orders</h2></div>

                {pendingOrders.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "14px 0" }}>No pending orders.</p>
                ) : (
                  <div className="pending-orders-grid">
                    {pendingOrders.map((order) => {
                      const hasPendingItems = (order.items || []).some(
                        (item) => getItemStatus(item) === "pending"
                      );

                      return (
                        <div key={order.id} className="pending-order-card">
                          <div className="pending-top">
                            <div>
                              <h3>Order #{order.id.slice(0, 6)}</h3>
                              <p>
                                {order.createdAt?.seconds
                                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-PH", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric"
                                    })
                                  : "No date"}
                              </p>
                              <p>
                                Customer: {order.customerName || order.customerEmail || "Unknown customer"}
                              </p>
                            </div>
                            <strong>₱{Number(order.total || 0).toFixed(2)}</strong>
                          </div>

                          <div className="pending-items">
                            {(order.items || []).map((item, idx) => {
                              const statusStyle = getItemStatusStyle(getItemStatus(item));

                              return (
                                <div key={idx} className="pending-item-card">
                                  <div className="pending-item-head">
                                    <div>
                                      <strong>{item.name}</strong>
                                      <p>
                                        x {item.quantity} • ₱
                                        {Number(
                                          item.subtotal ||
                                            Number(item.price || 0) * Number(item.quantity || 0)
                                        ).toFixed(2)}
                                      </p>
                                    </div>

                                    <span
                                      className="status-badge"
                                      style={{
                                        color: statusStyle.color,
                                        backgroundColor: statusStyle.bg
                                      }}
                                    >
                                      {statusStyle.label}
                                    </span>
                                  </div>

                                  <div className="item-actions">
                                    <button
                                      className="btn-item-done"
                                      onClick={() => updateOrderItemStatus(order.id, idx, "done")}
                                      disabled={getItemStatus(item) === "done"}
                                    >
                                      Done Item
                                    </button>

                                    <button
                                      className="btn-item-void"
                                      onClick={() => updateOrderItemStatus(order.id, idx, "void")}
                                      disabled={getItemStatus(item) === "void"}
                                    >
                                      Void Item
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pending-actions">
                            <button
                              className="btn-complete"
                              onClick={() => completeOrder(order.id)}
                              disabled={hasPendingItems}
                            >
                              Complete Order
                            </button>

                            <button className="btn-void" onClick={() => voidOrder(order.id)}>
                              Void Whole Order
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "products" && (
            <div className="glass-card">
              <div className="card-header"><h2>Product Management</h2></div>

              <div className="form-group">
                <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input placeholder="Price (₱)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="prod-img"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
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
                        <td>
                          <div className="img-center-wrapper">
                            <img
                              src={p.imageUrl || "/placeholder.png"}
                              className="table-img"
                              alt={p.name}
                              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                            />
                          </div>
                        </td>
                        <td className="font-bold">{p.name}</td>
                        <td>{p.category}</td>
                        <td className="price-tag">₱{Number(p.price).toLocaleString()}</td>
                        <td>
                          <button className="btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan="5">No products yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "ingredients" && (
            <div className="glass-card">
              <div className="card-header"><h2>Ingredients Inventory</h2></div>

              <div className="ingredient-mode-wrap">
                <button className={ingredientMode === "new" ? "mode-btn active" : "mode-btn"} onClick={() => setIngredientMode("new")}>
                  Add New Ingredient
                </button>
                <button className={ingredientMode === "restock" ? "mode-btn active" : "mode-btn"} onClick={() => setIngredientMode("restock")}>
                  Add on Current Ingredient
                </button>
              </div>

              {ingredientMode === "new" ? (
                <div className="form-group">
                  <div className="alert-summary">
                    <h3>Low Stock Alerts</h3>
                    <p>{ingredients.filter((i) => getStockStatus(i.stock, i.unit).label === "Low").length} low stock item(s)</p>
                  </div>

                  <input placeholder="Ingredient Name" value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} />
                  <select value={ingUnit} onChange={(e) => setIngUnit(e.target.value)}>
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                  </select>
                  <input placeholder={`Stock Qty (${ingUnit})`} type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                  <input placeholder={`Price per ${ingUnit} (₱)`} type="number" value={ingPrice} onChange={(e) => setIngPrice(e.target.value)} />
                  <button className="btn-primary" onClick={addIngredient}>Add Item</button>
                </div>
              ) : (
                <div className="form-group">
                  <select value={restockIngredientId} onChange={(e) => setRestockIngredientId(e.target.value)}>
                    <option value="">Select Current Ingredient</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.stock} {i.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Amount to Add"
                    type="number"
                    step="0.01"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                  />

                  <button className="btn-primary" onClick={restockIngredient}>
                    Add Stock Precisely
                  </button>
                </div>
              )}

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
                          <td>{i.stock} {i.unit}</td>
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
                            <button className="btn-danger" onClick={() => deleteIngredient(i.id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                    {ingredients.length === 0 && (
                      <tr><td colSpan="7">No ingredients yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "costing" && (
            <div className="glass-card">
              <div className="card-header"><h2>Cost Analysis</h2></div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <div style={smallCard}>
                  <h4>Highest Recipe Profit</h4>
                  <p>{profitInsights.topProfit?.name || "N/A"}</p>
                  <strong>₱{Number(profitInsights.topProfit?.profit || 0).toFixed(2)}</strong>
                </div>
                <div style={smallCard}>
                  <h4>Lowest Recipe Profit</h4>
                  <p>{profitInsights.lowProfit?.name || "N/A"}</p>
                  <strong>₱{Number(profitInsights.lowProfit?.profit || 0).toFixed(2)}</strong>
                </div>
                <div style={smallCard}>
                  <h4>Best Margin Product</h4>
                  <p>{profitInsights.topMargin?.name || "N/A"}</p>
                  <strong>{Number(profitInsights.topMargin?.margin || 0).toFixed(2)}%</strong>
                </div>
                <div style={smallCard}>
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
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
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
                          <option key={unit} value={unit}>{unit}</option>
                        ))
                      )}
                    </select>

                    <button className="btn-primary" onClick={addRecipeIngredient}>Add to Recipe</button>
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
                              <button className="btn-danger" onClick={() => deleteRecipeIngredient(r.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {productRecipe.length === 0 && (
                          <tr><td colSpan="6">No recipe ingredients yet.</td></tr>
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
                      <tr><td colSpan="6">No costing analysis available yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="glass-card">
              <div className="card-header"><h2>Sales History</h2></div>

              <div style={{ marginBottom: "24px" }}>
                <h3>Completed Orders</h3>
                {completedOrders.length === 0 ? (
                  <p>No completed orders yet.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="black-border-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Shift</th>
                          <th>Total</th>
                          <th>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id.slice(0, 6)}</td>
                            <td>
                              {order.completedAt?.seconds
                                ? new Date(order.completedAt.seconds * 1000).toLocaleString("en-PH")
                                : "-"}
                            </td>
                            <td>{order.shiftName || "-"}</td>
                            <td>₱{Number(order.total || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "left" }}>
                              {(order.items || []).map((item, idx) => (
                                <div key={idx}>
                                  {item.name} x {item.quantity} [{getItemStatus(item)}]
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3>Voided Orders</h3>
                {voidedOrders.length === 0 ? (
                  <p>No voided orders yet.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="black-border-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voidedOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id.slice(0, 6)}</td>
                            <td>
                              {order.voidedAt?.seconds
                                ? new Date(order.voidedAt.seconds * 1000).toLocaleString("en-PH")
                                : "-"}
                            </td>
                            <td>₱{Number(order.total || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "left" }}>
                              {(order.items || []).map((item, idx) => (
                                <div key={idx}>
                                  {item.name} x {item.quantity}
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <style>{`
        .admin-container {
          background-color: #fff7f0;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          color: #4a3728;
        }

        .admin-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .admin-header {
          margin-bottom: 2rem;
        }

        .admin-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .admin-header h1 {
          font-size: 2.4rem;
          color: #6b4f3a;
          margin: 0;
          font-weight: 800;
        }

        .logout-btn {
          background: #b3261e;
          color: white;
          padding: 10px 18px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
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

        .card-header {
          margin-bottom: 1rem;
        }

        .card-header h2 {
          margin: 0;
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

        .ingredient-mode-wrap {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .mode-btn {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid #6b4f3a;
          background: white;
          color: #6b4f3a;
          font-weight: 700;
          cursor: pointer;
        }

        .mode-btn.active {
          background: #6b4f3a;
          color: white;
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

        .btn-danger {
          background: #b3261e;
          color: white;
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .btn-complete {
          background: #2e7d32;
          color: white;
          padding: 10px 14px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          flex: 1;
        }

        .btn-complete:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .btn-void {
          background: #b3261e;
          color: white;
          padding: 10px 14px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          flex: 1;
        }

        .btn-item-done {
          background: #2e7d32;
          color: white;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          flex: 1;
        }

        .btn-item-done:disabled,
        .btn-item-void:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-item-void {
          background: #b3261e;
          color: white;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          flex: 1;
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

        .table-wrapper {
          overflow-x: auto;
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

        .pending-orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .pending-order-card {
          border: 1px solid #000;
          border-radius: 16px;
          padding: 16px;
          background: #fbf9f7;
        }

        .pending-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .pending-top h3 {
          margin: 0 0 6px 0;
        }

        .pending-top p {
          margin: 0;
          color: #7a6a5c;
          font-size: 0.9rem;
        }

        .pending-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .pending-item-card {
          border: 1px dashed #d6c8bc;
          border-radius: 12px;
          padding: 10px;
          background: white;
        }

        .pending-item-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
          align-items: center;
        }

        .pending-item-head p {
          margin: 4px 0 0 0;
          color: #7a6a5c;
          font-size: 0.9rem;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .pending-actions {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .admin-topbar,
          .form-group,
          .pending-actions,
          .item-actions,
          .ingredient-mode-wrap {
            flex-direction: column;
          }

          input, select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

const dashboardCard = {
  padding: "16px",
  border: "1px solid #000",
  borderRadius: "12px",
  background: "#fbf9f7",
  textAlign: "center"
};

const smallCard = {
  padding: "16px",
  border: "1px solid #000",
  borderRadius: "12px",
  background: "#fbf9f7"
};