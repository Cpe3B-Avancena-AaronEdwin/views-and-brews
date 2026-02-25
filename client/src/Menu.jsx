import Navbar from "./Navbar";

function Menu() {
  const items = [
    { name: "Espresso", price: 100 },
    { name: "Cappuccino", price: 150 },
    { name: "Latte", price: 160 },
    { name: "Mocha", price: 170 },
  ];

  return (
    <div style={{ backgroundColor: "#fff7f0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2 style={{ color: "#6b4f3a" }}>Our Menu</h2>
        <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
          {items.map((item, index) => (
            <li key={index} style={{ margin: "10px 0", fontSize: "18px" }}>
              {item.name} - ₱{item.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Menu;