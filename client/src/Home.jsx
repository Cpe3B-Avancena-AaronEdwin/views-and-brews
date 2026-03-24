import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "./Navbar";
import "./styles/Home.css"; 

export default function Home() {
  const navigate = useNavigate(); // Initialize the navigate function

  const [items, setItems] = useState([
    {
      id: 1,
      name: "Morning Brew",
      des: "The perfect start to your journey with our signature dark roast.",
      img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      name: "Views & Brews",
      des: "Experience coffee like never before with breathtaking scenery.",
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 3,
      name: "Espresso Art",
      des: "Carefully crafted lattes made by our expert baristas.",
      img: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 4,
      name: "Forest Filter",
      des: "Deep, earthy undertones inspired by the serenity of the woods.",
      img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 5,
      name: "Sunset Roast",
      des: "Wind down with the perfect blend as the sun dips below the horizon.",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 6,
      name: "Peak Performance",
      des: "High-altitude beans for a bold, energetic flavor profile.",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    },
  ]);

  const handleNext = () => {
    setItems((prev) => {
      const clone = [...prev];
      const first = clone.shift();
      clone.push(first);
      return clone;
    });
  };

  const handlePrev = () => {
    setItems((prev) => {
      const clone = [...prev];
      const last = clone.pop();
      clone.unshift(last);
      return clone;
    });
  };

  return (
    <div className="home-page-container">
      {/* SECTION 1: HERO SLIDER */}
      <section className="hero-section">
        <div className="nav-overlay">
          <Navbar />
        </div>

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />

        <div className="slide-container">
          <div className="slide">
            {items.map((item) => (
              <div
                key={item.id}
                className="item"
                style={{ backgroundImage: `url(${item.img})` }}
              >
                <div className="content">
                  <div className="name">{item.name}</div>
                  <div className="des">{item.des}</div>
                  {/* Click event added to navigate to /menu */}
                  <button 
                    className="see-more" 
                    onClick={() => navigate("/menu")}
                  >
                    Explore Menu
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="button-nav">
            <button className="prev" onClick={handlePrev}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button className="next" onClick={handleNext}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: VISION & MISSION */}
      <section className="about-section">

        <div className="about-content">
          <div className="about-card">
            <div className="icon-box">
              <i className="fa-solid fa-eye"></i>
            </div>
            <h2>Our Vision</h2>
            <p>
              To be the world’s most inspiring coffee destination, where every
              cup is served with a view that fuels the soul and sparks
              creativity.
            </p>
          </div>

          <div className="about-card">
            <div className="icon-box">
              <i className="fa-solid fa-rocket"></i>
            </div>
            <h2>Our Mission</h2>
            <p>
              To craft exceptional coffee experiences by combining premium,
              sustainably sourced beans with breathtaking locations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}