import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { useNavigate } from let x=1000;

export default function Menu() {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState("");

  const categories = [
    "All",
    "Favorites",
    "Coffee Based",
    "Non-Coffee Based",
    "Matcha Series",
    "Chocolate Series",
    "Barista's Choice",
    "Soda",
    "Dirty Soda"
  ];

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setProducts(items);
    });

    let unsubscribeUser = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setFavoriteProductIds([]);
        return;
      }

      unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (userSnap) => {
        const userData = userSnap.exists() ? userSnap.data() : {};
        setFavoriteProductIds(userData.favoriteProductIds || []);
      });
    });

    return () => {
      unsubscribeProducts();
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : activeCategory === "Favorites"
      ? products.filter((p) => favoriteProductIds.includes(p.id))
      : products.filter((p) => p.category === activeCategory);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [cart]);

  const toggleFavorite = async (productId) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first to save favorites.");
      return;
    }

    try {
      setFavoriteLoadingId(productId);
      const userRef = doc(db, "users", user.uid);
      const isFavorite = favoriteProductIds.includes(productId);

      await updateDoc(userRef, {
        favoriteProductIds: isFavorite
          ? arrayRemove(productId)
          : arrayUnion(productId)
      });
    } catch (err) {
      console.error("Favorite toggle error:", err);
      alert("Failed to update favorites.");
    } finally {
      setFavoriteLoadingId("");
    }
  };

  const placeOrder = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first before placing an order.");
      navigate("/login");
       return;
      }     
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const customerName =
        userData.displayName ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Customer";

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerEmail: user.email || "",
        customerName,

        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category || "",
          price: Number(item.price),
          quantity: Number(item.quantity),
          subtotal: Number(item.price) * Number(item.quantity)
        })),

        total: Number(cartTotal),
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("Order placed successfully!");
      setCart([]);
    } catch (err) {
      console.error("Place order error:", err);
      alert("Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content-spacing">
        <div className="main-content-card">
          <header className="menu-header">
            <span className="subtitle">Premium Selection</span>
            <h1>Our Coffee Selection</h1>
            <div className="header-line"></div>

            <div className="category-container">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          <div className="menu-layout">
            <main className="product-grid">
              {filteredProducts.map((p) => {
                const isFavorite = favoriteProductIds.includes(p.id);

                return (
                  <div key={p.id} className="product-card">
                    <div className="image-container">
                      <img
                        src={p.imageUrl || "/placeholder.png"}
                        alt={p.name}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />

                      <button
                        className={`favorite-btn ${isFavorite ? "active" : ""}`}
                        onClick={() => toggleFavorite(p.id)}
                        disabled={favoriteLoadingId === p.id}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="product-info">
                      <h3>{p.name}</h3>
                      <p className="price">₱{Number(p.price).toLocaleString()}</p>
                      <p className="description">
                        {p.description || "A delicious blend of premium ingredients."}
                      </p>

                      <button className="order-btn" onClick={() => addToCart(p)}>
                        Add to Order
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <p className="no-products">No items found in this category.</p>
              )}
            </main>

            <aside className="cart-panel">
              <div className="cart-header">
                <h2>Current Order</h2>
                <span>{cart.length} item(s)</span>
              </div>

              {cart.length === 0 ? (
                <p className="empty-cart">No items added yet.</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <p>₱{Number(item.price).toFixed(2)}</p>
                        </div>

                        <div className="qty-controls">
                          <button onClick={() => decreaseQty(item.id)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQty(item.id)}>+</button>
                        </div>

                        <div className="cart-item-right">
                          <strong>
                            ₱
                            {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </strong>

                          <button
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total</span>
                      <strong>₱{cartTotal.toFixed(2)}</strong>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={placeOrder}
                      disabled={placingOrder}
                    >
                      {placingOrder ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        .page-wrapper {
          background-color: #fff7f0;
          background-image: radial-gradient(#dccbb5 0.5px, transparent 0.5px);
          background-size: 20px 20px;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .content-spacing {
          padding: 80px 20px;
          display: flex;
          justify-content: center;
        }

        .main-content-card {
          width: 100%;
          max-width: 1350px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(74, 55, 40, 0.12);
          padding: 60px 40px;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .menu-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .subtitle {
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #bc8a5f;
        }

        .menu-header h1 {
          font-size: 3rem;
          margin: 10px 0;
          font-weight: 900;
          color: #2d241e;
        }

        .header-line {
          width: 50px;
          height: 3px;
          background: #bc8a5f;
          margin: 15px auto 30px;
        }

        .category-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .cat-btn {
          padding: 8px 20px;
          border-radius: 20px;
          border: 1px solid #dccbb5;
          background: white;
          color: #6b5a4c;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cat-btn:hover {
          background: #fdf8f4;
          border-color: #bc8a5f;
        }

        .cat-btn.active {
          background: #2d241e;
          color: white;
          border-color: #2d241e;
          box-shadow: 0 4px 12px rgba(45, 36, 30, 0.2);
        }

        .menu-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 30px;
        }

        .product-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid #f0f0f0;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.08);
        }

        .image-container {
          width: 100%;
          height: 200px;
          background: #fafafa;
          position: relative;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }

        .favorite-btn.active {
          color: #c62828;
        }

        .product-info {
          padding: 20px;
          text-align: center;
          flex-grow: 1;
        }

        .product-info h3 {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
          color: #2d241e;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 800;
          color: #bc8a5f;
          margin-bottom: 10px;
        }

        .description {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .order-btn,
        .checkout-btn {
          width: 100%;
          background: #2d241e;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }

        .order-btn:hover,
        .checkout-btn:hover {
          background: #bc8a5f;
        }

        .checkout-btn:disabled {
          background: #a79a91;
          cursor: not-allowed;
        }

        .cart-panel {
          background: #ffffff;
          border: 1px solid #f0e7e0;
          border-radius: 20px;
          padding: 20px;
          position: sticky;
          top: 20px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
        }

        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .cart-header h2 {
          margin: 0;
          color: #2d241e;
          font-size: 1.3rem;
        }

        .empty-cart,
        .no-products {
          text-align: center;
          color: #888;
          padding: 20px;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 460px;
          overflow-y: auto;
          margin-bottom: 16px;
        }

        .cart-item {
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 12px;
          display: grid;
          gap: 10px;
        }

        .cart-item-info h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
        }

        .cart-item-info p {
          margin: 0;
          color: #8a6c54;
          font-weight: 700;
        }

        .qty-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qty-controls button {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 8px;
          background: #2d241e;
          color: white;
          cursor: pointer;
        }

        .cart-item-right {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .remove-btn {
          background: transparent;
          color: #b3261e;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .cart-footer {
          border-top: 1px solid #eee;
          padding-top: 16px;
        }

        .cart-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          font-size: 1.1rem;
        }

        @media (max-width: 992px) {
          .menu-layout {
            grid-template-columns: 1fr;
          }

          .cart-panel {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .main-content-card { padding: 40px 20px; }
          .menu-header h1 { font-size: 2.2rem; }
        }
      `}</style>
    </div>
  );
}
