import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        navigate("/admin");
      } else {
        setError("Invalid login");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Server not responding");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Login</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>

      <br /><br />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}