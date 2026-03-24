// client/src/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
const API = "http://localhost:5000";

export default function Login({ setIsAdminLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  try {
    setLoading(true);
    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setError("Invalid username or password");
      return;
    }

    const data = await res.json();

    // STEP 1: Save the flag to the browser's permanent memory
    localStorage.setItem("isLoggedIn", "true"); 
    if (data.token) localStorage.setItem("adminToken", data.token);

    // STEP 2: Tell React state you are logged in
    setIsAdminLoggedIn(true);

    // STEP 3: Now move to the admin page
    navigate("/admin");
  } catch (err) {
    setError("Server error.");
  } finally {
    setLoading(false);
  }
};
  
return (



    <div style={styles.pageWrapper}>

      <Navbar onMenuClick={() => setSidebarOpen(true)} />
<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Admin</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div style={styles.footerCurve}>
            <span style={styles.footerText}>Views & Brews</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
    minHeight: "100vh",
  },



  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "80px",
  },



  card: {
    width: "380px",
    padding: "40px 0 0 0",
    borderRadius: "24px",
    backgroundColor: "#6b4f3a",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },



  title: {
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "30px",
  },



  form: {
    width: "80%",
    marginBottom: "60px",
  },

  input: {
    width: "100%",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#f5f5f5",
    fontSize: "16px",
    boxSizing: "border-box",
  },



  button: {
    width: "100%",
    padding: "15px",
    borderRadius: "8px",
    border: "2px solid #fff",
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",

  },



  error: {
    color: "#ffda79",
    marginBottom: "10px",
    fontSize: "14px",
    textAlign: "center",
  },

  footerCurve: {
    width: "140%",
    height: "100px",
    backgroundColor: "#fff",
    borderRadius: "50% 50% 0 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },



  footerText: {
    color: "#6b4f3a",
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "20px",
  },
};