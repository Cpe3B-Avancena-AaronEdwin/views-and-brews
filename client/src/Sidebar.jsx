import { Link } from "react-router-dom";
import ClientLogout from "./ClientLogout";
import "./styles.css";

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div
      className="sidebar"
      style={{
        left: isOpen ? "0" : "-250px",   // slides in
        display: isOpen ? "flex" : "none" // completely hidden when closed
      }}
    >
      {/* Profile Picture */}
      <img
        src="https://via.placeholder.com/80"
        alt="Profile"
        className="profile-pic"
      />

      {/* Links */}
      <Link to="/signup" onClick={toggleSidebar}>Signup</Link>
      <Link to="/client-login" onClick={toggleSidebar}>Login</Link>

      {/* Logout if logged in */}
      {localStorage.getItem("token") && <ClientLogout />}
    </div>
  );
}