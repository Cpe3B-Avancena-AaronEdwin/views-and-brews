import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ClientLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if client is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/client-login", form);

      // Store token
      localStorage.setItem("token", res.data.token);

      setMessage(res.data.message);
      setLoggedIn(true);

      // Redirect after login
      setTimeout(() => navigate("/home"), 500);
    } catch (err) {
      console.log("ERROR:", err);

      if (err.response) {
        setMessage(err.response.data.message);
      } else {
        setMessage("SERVER NOT RESPONDING");
      }
    }
  };

  // If already logged in, don't show login form
  if (loggedIn) {
    return (
      <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
        <h2>You are already logged in</h2>
        <p>Go to your <strong>sidebar</strong> to see your profile and logout</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
      <h2>Client Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem", fontSize: "1rem", cursor: "pointer" }}>
          Login
        </button>
      </form>
      {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}
    </div>
  );
}