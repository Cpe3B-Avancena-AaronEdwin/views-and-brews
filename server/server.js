// server/server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB CONNECTION ================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "189466164",
  database: "views_and_brews"
});

db.connect((err) => {
  if (err) console.log("Database connection failed:", err);
  else console.log("Connected to MySQL");
});

/* ================= AUTH ================= */

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length > 0) res.json({ success: true });
      else res.status(401).json({ success: false });
    }
  );
});

/* ================= PRODUCTS ================= */

// Get all products
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

// Add product
app.post("/api/products", (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) return res.status(400).json({ message: "Missing fields" });

  db.query("INSERT INTO products (name, price) VALUES (?, ?)", [name, price], (err) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json({ success: true });
  });
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true });
  });
});

/* ================= INGREDIENTS ================= */

// Get all ingredients
app.get("/api/ingredients", (req, res) => {
  db.query("SELECT * FROM ingredients ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

// Add ingredient
app.post("/api/ingredients", (req, res) => {
  const { name, stock } = req.body;
  if (!name || stock === undefined) return res.status(400).json({ message: "Missing fields" });

  db.query("INSERT INTO ingredients (name, stock) VALUES (?, ?)", [name, stock], (err) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json({ success: true });
  });
});

// Delete ingredient
app.delete("/api/ingredients/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM ingredients WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ingredient not found" });
    res.json({ success: true });
  });
});

// Update ingredient stock
app.patch("/api/ingredients/:id", (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || isNaN(Number(stock))) return res.status(400).json({ message: "Invalid stock" });

  db.query("UPDATE ingredients SET stock = ? WHERE id = ?", [Number(stock), id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ingredient not found" });
    res.json({ success: true });
  });
});

/* ================= START SERVER ================= */
app.listen(5000, () => console.log("Server running on port 5000"));