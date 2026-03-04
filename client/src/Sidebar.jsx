// client/src/Sidebar.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";


export default function Sidebar({ isOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/client-login");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      
      {/* CLOSE BUTTON */}
      <button className="close-btn" onClick={toggleSidebar}>✖</button>

      {/* ================= NOT LOGGED IN ================= */}
      {!user && (
        <div className="sidebar-content">
          <Link to="/client-login" className="sidebar-link">
            Login
          </Link>
        </div>
      )}

      {/* ================= LOGGED IN ================= */}
      {user && (
        <div className="sidebar-content logged-in">

          {/* PROFILE FRAME CENTER TOP */}
          <div className="profile-section">
            <div className="profile-frame">
              <img
                src={user.profilePic || "/default-profile.png"}
                alt="Profile"
              />
              <input type="file" className="upload-input" />
            </div>
          </div>

          {/* SPACE */}
          <div className="divider"></div>

          {/* BASIC INFO */}
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>{user.address}</p>
            <p>{user.number}</p>
          </div>

          {/* ABOUT ME DROPDOWN */}
          <div className="about-section">
            <button
              className="about-btn"
              onClick={() => setAboutOpen(!aboutOpen)}
            >
              About Me ▼
            </button>

            {aboutOpen && (
              <div className="about-content">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Birthday:</strong> {user.birthday}</p>
              </div>
            )}
          </div>

          {/* PUSH BOTTOM */}
          <div className="bottom-section">

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>

            <button
              className="switch-btn"
              onClick={() => navigate("/client-login")}
            >
              Switch / Add Account
            </button>

          </div>

        </div>
      )}
    </div>
  );
}