import { Link } from "react-router-dom";

function Navbar({ onMenuClick }) {
  return (
    <nav
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#6b4f3a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button
          onClick={onMenuClick}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer"
          }}
        >
          ☰
        </button>

        <span style={{ fontWeight: "bold", fontSize: "20px" }}>
          Views & Brews
        </span>
      </div>

      <div>
        <Link to="/" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Home</Link>
        <Link to="/menu" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Menu</Link>
        <Link to="/about" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>About</Link>
        <Link to="/login" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Admin</Link>
      </div>
    </nav>
  );
}

export default Navbar;