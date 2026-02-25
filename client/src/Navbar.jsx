import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{
      textAlign: "center",
      padding: "20px",
      backgroundColor: "#6b4f3a",
      color: "white"
    }}>
      <Link to="/" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/menu" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Menu</Link>
      <Link to="/about" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>About</Link>
      <Link to="/login" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Admin</Link>
    </nav>
  );
}

export default Navbar;