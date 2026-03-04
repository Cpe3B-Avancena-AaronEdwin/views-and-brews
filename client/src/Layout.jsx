// client/src/Layout.jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{ backgroundColor: "#fff7f0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "" }}>
        {children}
      </div>
    </div>
  );
}