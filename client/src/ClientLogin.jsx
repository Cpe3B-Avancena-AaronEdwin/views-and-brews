// client/src/ClientLogin.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ClientLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/client-login", form);

      // Store token in localStorage for protected routes
      localStorage.setItem("token", res.data.token);

      setMessage(res.data.message);

      // Redirect to homepage or menu after login
      setTimeout(() => {
        navigate("/menu");
      }, 500);
    } catch (err) {
  console.log("ERROR:", err);
  console.log("ERR RESPONSE:", err.response);
  console.log("ERR MESSAGE:", err.message);

  if (err.response) {
    setMessage(err.response.data.message);
  } else {
    setMessage("SERVER NOT RESPONDING");
  }
   }
  };

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