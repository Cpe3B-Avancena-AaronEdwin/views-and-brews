import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { registerCustomer } from "./auth";

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      return setError("Please enter your name.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await registerCustomer(email, password, displayName.trim());
      alert("Registration successful. You can now log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("Email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Failed to register.");
      }
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
          <h2 style={styles.title}>Create Account</h2>

          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={styles.input}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Creating Account..." : "Register"}
            </button>

            <p style={styles.linkText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>
                Login
              </Link>
            </p>
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
    width: "400px",
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

  linkText: {
    textAlign: "center",
    color: "#fff",
    marginTop: "16px",
    fontSize: "14px",
  },

  link: {
    color: "#ffda79",
    textDecoration: "none",
    fontWeight: "bold",
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