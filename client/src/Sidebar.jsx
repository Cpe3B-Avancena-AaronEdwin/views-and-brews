import { Link } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "bold",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.15)"
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? "0" : "-260px",
          width: "250px",
          height: "100vh",
          backgroundColor: "#5a3e2b",
          color: "white",
          padding: "90px 20px 20px 20px",
          transition: "0.3s ease",
          zIndex: 1300,
          boxShadow: isOpen ? "2px 0 12px rgba(0,0,0,0.25)" : "none",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <Link to="/" style={linkStyle} onClick={onClose}>Home</Link>
          <Link to="/about" style={linkStyle} onClick={onClose}>About</Link>
          <Link to="/login" style={linkStyle} onClick={onClose}>Login</Link>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.35)",
            zIndex: 1200
          }}
        />
      )}
    </>
  );
}

export default Sidebar;