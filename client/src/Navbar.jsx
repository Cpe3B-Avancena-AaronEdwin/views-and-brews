function Navbar({ onMenuClick }) {
  return (
    <nav
      style={{
        padding: "20px",
        backgroundColor: "#6b4f3a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        position: "sticky",
        top: 0,
        zIndex: 10
      }}
    >
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
        Brews & Views
      </span>

      <div style={{ width: "24px" }} /> {/* spacing balance */}
    </nav>
  );
}

export default Navbar;