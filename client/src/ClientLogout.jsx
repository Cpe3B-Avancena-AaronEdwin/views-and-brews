// ClientLogout.jsx
import { useNavigate } from "react-router-dom";

export default function ClientLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove JWT
    navigate("/client-login"); // redirect to login page
  };

  return <button onClick={handleLogout}>Logout</button>;
}