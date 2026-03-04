// client/src/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);

      // Fetch user info from backend
      fetch("http://localhost:5000/api/client-data", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(err => {
          console.log("Sidebar fetch error:", err);
          setLoggedIn(false);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUserData(null);
    navigate("/client-login");
  };

  return (
    <div
      className="sidebar"
      style={{
        left: isOpen ? "0" : "-250px",
        display: isOpen ? "flex" : "none",
        flexDirection: "column",
      }}
    >
      {loggedIn && userData ? (
        <>
          {/* Profile picture and name */}
          <img
            src={userData.avatar || "https://via.placeholder.com/80"}
            alt="Profile"
            className="profile-pic"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: "pointer" }}
          />
          <p onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: "pointer" }}>
            {userData.name}
          </p>

          {/* Dropdown with email & phone */}
          {dropdownOpen && (
            <div className="profile-dropdown" style={{ textAlign: "left", marginBottom: "1rem" }}>
              <p>Email: {userData.email}</p>
              {userData.phone && <p>Phone: {userData.phone}</p>}
            </div>
          )}

          {/* Logout and switch/add account */}
          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="sidebar-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/client-login");
            }}
          >
            Switch / Add Account
          </button>
        </>
      ) : (
        <>
          {/* Show login/signup if not logged in */}
          <Link to="/signup" onClick={toggleSidebar}>
            Signup
          </Link>
          <Link to="/client-login" onClick={toggleSidebar}>
            Login
          </Link>
        </>
      )}
    </div>
  );
}