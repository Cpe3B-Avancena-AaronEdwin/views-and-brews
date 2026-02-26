// client/src/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Login({ setIsAdminLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        alert("Invalid credentials");
        return;
      }

      setIsAdminLoggedIn(true);
      navigate("/admin");
    } catch {
      alert("Server error");
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h1>Admin Login</h1>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}