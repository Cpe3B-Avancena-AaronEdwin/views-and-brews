import { useEffect, useState } from "react";
import Navbar from "./Navbar";


const API = "http://localhost:5000";

export default function Menu() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="menu-container">
      <Navbar />

      <div className="menu-content">
        <h1 className="menu-title">Our Menu</h1>

        <div className="menu-grid">
          {products.map(p => (
            <div key={p.id} className="menu-item">
              <img
                src={p.image ? API + p.image : "/placeholder.png"}
                alt={p.name}
                className="menu-image"
              />
              <h3 className="menu-name">{p.name}</h3>
              <p className="menu-price">₱{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}