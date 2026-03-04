// server/routes/client.js
import express from "express";
import db from "./views-and-brews"; // the MySQL connection
import jwt from "jsonwebtoken";

const router = express.Router();

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, "YOUR_SECRET_KEY", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id; // user id from JWT
    next();
  });
}

// Returns user info from `users` table
router.get("/api/client-data", verifyToken, (req, res) => {
  const userId = req.userId;

  db.query(
    "SELECT id, name, email, phone, avatar FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0) return res.status(404).json({ message: "User not found" });

      res.json(results[0]);
    }
  );
});

export default router;