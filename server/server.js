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
  password: "189466164", // ← change this
  database: "views_and_brews"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

/* ================= AUTH (SIMPLE ADMIN LOGIN) ================= */

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

/* ================= PRODUCTS ================= */
app.post("/api/products", (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Missing name or price" });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    const sql = "INSERT INTO products (name, price) VALUES (?, ?)";
    db.query(sql, [name, numericPrice], (err) => {
      if (err) {
        console.log("ADD PRODUCT ERROR:", err.sqlMessage);
        return res.status(500).json({ message: err.sqlMessage });
      }
      res.json({ success: true });
    });
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= INGREDIENTS ================= */

app.get("/api/ingredients", (req, res) => {
  db.query("SELECT * FROM ingredients ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json([]);
    res.json(result);
  });
});

app.post("/api/ingredients", (req, res) => {
  const { name, stock } = req.body;

  db.query(
    "INSERT INTO ingredients (name, stock) VALUES (?, ?)",
    [name, stock],
    (err) => {
      if (err) return res.status(500).send("Error adding ingredient");
      res.send("Ingredient added");
    }
  );
});

// Delete product by ID
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log("DELETE PRODUCT ERROR:", err.sqlMessage);
      return res.status(500).json({ message: err.sqlMessage });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true });
  });
});

// get products
// Get all products
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.log("FETCH PRODUCTS ERROR:", err.sqlMessage);
      return res.status(500).json({ message: err.sqlMessage });
    }
    res.json(results);
  });
});
/* ================= START SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});