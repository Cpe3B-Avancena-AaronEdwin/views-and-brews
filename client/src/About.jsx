import Navbar from "./Navbar";

function About() {
  return (
    <div style={{ backgroundColor: "#fff7f0", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "50px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
        <h2 style={{ color: "#6b4f3a" }}>About Views and Brews</h2>
        <p>
          We serve premium coffee with a relaxing view. Enjoy handcrafted beverages and pastries in a cozy environment.
          Open daily from 7 AM to 10 PM.
        </p>
        <img 
          src="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80" 
          alt="Coffee Shop" 
          style={{ width: "100%", borderRadius: "10px", marginTop: "20px" }}
        />
      </div>
    </div>
  );
}

export default About;