import { useEffect, useState } from "react";
import Navbar from "./Navbar";

const API = "http://localhost:5000";

export default function Menu() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="menu-container">
      <Navbar />

      <header className="menu-header">
        <h1>Our Coffee Selection</h1>
        <p>Freshly brewed, just for you.</p>
      </header>

      <main className="product-grid">
        {products.map((p) => (
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
              
              {/* --- NEW DESCRIPTION ELEMENT --- */}
              <p className="description">{p.description || "A delicious blend of premium beans."}</p>
              
              <button className="order-btn">Add to Order</button>
            </div>
          </div>
        ))}
      </main>

      <style jsx>{`
        .menu-container {
          background-color: #fff7f0;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding-bottom: 60px;
        }

        .menu-header {
          text-align: center;
          padding: 50px 20px 30px;
          color: #4a3728;
        }

        .menu-header h1 {
          font-size: 2.8rem;
          margin: 0;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .product-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 25px;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .product-card {
          background: #ffffff;
          border: 1.5px solid #000;
          width: calc(20% - 25px);
          min-width: 200px;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative; /* Ensure z-index works correctly */
        }

        .product-card:hover {
          transform: scale(1.12);
          z-index: 10;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          border-color: #6b4f3a;
        }

        /* --- DESCRIPTION LOGIC --- */
        .description {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
          max-height: 0; /* Hidden by default */
          opacity: 0;    /* Hidden by default */
          overflow: hidden;
          transition: all 0.3s ease; /* Smooth slide down */
          line-height: 1.4;
        }

        .product-card:hover .description {
          max-height: 80px; /* Adjust based on your text length */
          opacity: 1;
          margin-top: 5px;
          margin-bottom: 10px;
        }

        .image-container {
          width: 100%;
          height: 180px;
          border-bottom: 1px solid #000;
          overflow: hidden;
          background: #fdfdfd;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .product-info {
          padding: 15px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex-grow: 1;
        }

        .product-info h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #2d2d2d;
          font-weight: 700;
        }

        .price {
          font-size: 1.2rem;
          font-weight: 800;
          color: #6b4f3a;
          margin: 0;
        }

        .order-btn {
          background: #000;
          color: #fff;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.3s;
          margin-top: auto;
        }

        .order-btn:hover {
          background: #6b4f3a;
          transform: translateY(-2px);
        }

        /* RESPONSIVE SCALING */
        @media (max-width: 1150px) { .product-card { width: calc(25% - 25px); } }
        @media (max-width: 900px) { .product-card { width: calc(33.33% - 25px); } }
        @media (max-width: 650px) { .product-card { width: calc(50% - 25px); } }
        @media (max-width: 450px) { .product-card { width: 100%; } }
      `}</style>
    </div>
  );
}