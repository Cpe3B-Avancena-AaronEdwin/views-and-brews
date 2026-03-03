import { useNavigate } from "react-router-dom";

export default function ClientLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/client-login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}