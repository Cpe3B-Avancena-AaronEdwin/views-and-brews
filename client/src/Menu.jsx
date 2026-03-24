import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const API = "http://localhost:5000";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = [
    "All",
    "Coffee Based",
    "Non-Coffee Based",
    "Matcha Series",
    "Chocolate Series",
    "Barista's Choice",
    "Soda",
    "Dirty Soda"
  ];

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

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

          <main className="product-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div className="image-container">
                  <img
                    src={p.image ? API + p.image : "/placeholder.png"}
                    alt={p.name}
                  />
                </div>
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="price">₱{Number(p.price).toLocaleString()}</p>
                  <p className="description">
                    {p.description || "A delicious blend of premium ingredients."}
                  </p>
                  <button className="order-btn">Add to Order</button>
                </div>
              </div>
            ))}
          </main>

          {filteredProducts.length === 0 && (
            <p className="no-products">No items found in this category.</p>
          )}
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
          max-width: 1200px;
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
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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

        .order-btn {
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

        .order-btn:hover {
          background: #bc8a5f;
        }

        .no-products {
          text-align: center;
          color: #888;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .main-content-card { padding: 40px 20px; }
          .menu-header h1 { font-size: 2.2rem; }
        }
      `}</style>
    </div>
  );
}