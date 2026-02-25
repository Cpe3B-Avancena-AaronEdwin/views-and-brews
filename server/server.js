import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // change if your MySQL username is different
  password: "189466164",         // put your MySQL password here
  database: "views_and_brews"
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// ===== Routes =====

// Admin login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM admins WHERE username=? AND password=?",
    [username, password],
    (err, results) => {
      if (err) return res.json({ success: false, error: err });
      res.json({ success: results.length > 0 });
    }
  );
});

// Get all products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.json([]);
    res.json(results);
  });
});

// Update stock
app.put("/update-stock/:id", (req, res) => {
  const { stock } = req.body;
  const { id } = req.params;
  db.query(
    "UPDATE products SET stock=? WHERE id=?",
    [stock, id],
    (err, results) => {
      if (err) return res.json({ success: false, error: err });
      res.json({ success: true });
    }
  );
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));