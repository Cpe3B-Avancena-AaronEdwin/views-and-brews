import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB ================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "189466164",
  database: "views_and_brews"
});

db.connect(err => {
  if (err) console.log("DB ERROR:", err);
  else console.log("MySQL Connected");
});


/* ================= IMAGE UPLOAD ================= */

const uploadPath = "./uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

/* ================= LOGIN (DB BASED) ================= */

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE username=? AND password=?",
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ success: false });
      if (results.length === 0)
        return res.status(401).json({ success: false });

      res.json({ success: true });
    }
  );
});

/* ================= PRODUCTS ================= */

app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

app.post("/api/products", upload.single("image"), (req, res) => {
  const { name, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
    [name, price, image],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], err => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

/* ================= INGREDIENTS ================= */

// get all
app.get("/api/ingredients", (req, res) => {
  db.query("SELECT * FROM ingredients ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

// add ingredient
app.post("/api/ingredients", (req, res) => {
  const { name, stock, price } = req.body;

  if (!name || stock === undefined || price === undefined) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    "INSERT INTO ingredients (name, stock, price) VALUES (?, ?, ?)",
    [name, Number(stock), Number(price)],
    err => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

// delete ingredient
app.delete("/api/ingredients/:id", (req, res) => {
  db.query(
    "DELETE FROM ingredients WHERE id=?",
    [req.params.id],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

// change stock (+ / -)
app.put("/api/ingredients/:id/stock", (req, res) => {
  const { change } = req.body;

  db.query(
    "UPDATE ingredients SET stock = stock + ? WHERE id=?",
    [change, req.params.id],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

/* ================= START ================= */

app.listen(5000, () => console.log("Server running on port 5000"));