import Navbar from "./Navbar";

function Home() {
  return (
    <div style={{ backgroundColor: "#fff7f0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1 style={{ color: "#6b4f3a" }}>Welcome to Views and Brews</h1>
        <p>Your favorite coffee with a view ☕</p>
        <img 
          src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" 
          alt="Coffee" 
          style={{ width: "50%", borderRadius: "10px", marginTop: "20px" }}
        />
      </div>
    </div>
  );
}

export default Home;