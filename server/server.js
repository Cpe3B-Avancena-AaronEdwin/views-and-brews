import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB ================= */

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
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
      if (results.length === 0) {
        return res.status(401).json({ success: false });
      }

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
  try {
    const { name, category, price } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and price are required"
      });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price format"
      });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    db.query(
      "INSERT INTO products (name, category, price, image) VALUES (?, ?, ?, ?)",
      [name, category, numericPrice, image],
      (err) => {
        if (err) {
          console.log("INSERT ERROR:", err);
          return res.status(500).json({
            success: false,
            message: "Database insert failed"
          });
        }

        res.json({
          success: true,
          message: "Product added successfully"
        });
      }
    );
  } catch (error) {
    console.log("SERVER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unexpected server error"
    });
  }
});

app.delete("/api/products/:id", (req, res) => {
  db.query(
    "DELETE FROM products WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.log("DELETE PRODUCT ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Database delete failed"
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully"
      });
    }
  );
});

/* ================= INGREDIENTS ================= */

app.get("/api/ingredients", (req, res) => {
  db.query("SELECT * FROM ingredients ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

app.post("/api/ingredients", (req, res) => {
  const { name, unit, stock, price } = req.body;

  if (!name || !unit || stock === undefined || price === undefined) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    "INSERT INTO ingredients (name, unit, stock, price) VALUES (?, ?, ?, ?)",
    [name, unit, Number(stock), Number(price)],
    (err) => {
      if (err) {
        console.log("ADD INGREDIENT ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

app.delete("/api/ingredients/:id", (req, res) => {
  db.query(
    "DELETE FROM ingredients WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

app.put("/api/ingredients/:id/stock", (req, res) => {
  const { change } = req.body;

  db.query(
    "UPDATE ingredients SET stock = stock + ? WHERE id=?",
    [change, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

/* ================= PRODUCT INGREDIENTS / COSTING ================= */

app.get("/api/products/:id/ingredients", (req, res) => {
  db.query(
    `SELECT 
      pi.id,
      pi.product_id,
      pi.ingredient_id,
      pi.quantity,
      i.name AS ingredient_name,
      i.unit AS ingredient_unit,
      i.price AS ingredient_price,
      i.stock AS ingredient_stock
     FROM product_ingredients pi
     JOIN ingredients i ON pi.ingredient_id = i.id
     WHERE pi.product_id = ?
     ORDER BY pi.id DESC`,
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log("GET PRODUCT INGREDIENTS ERROR:", err);
        return res.status(500).json([]);
      }
      res.json(results);
    }
  );
});

app.post("/api/products/:id/ingredients", (req, res) => {
  const { ingredient_id, quantity } = req.body;

  if (!ingredient_id || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: "ingredient_id and quantity are required"
    });
  }

  const numericQuantity = parseFloat(quantity);

  if (isNaN(numericQuantity) || numericQuantity <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a valid number greater than 0"
    });
  }

  db.query(
    "INSERT INTO product_ingredients (product_id, ingredient_id, quantity) VALUES (?, ?, ?)",
    [req.params.id, ingredient_id, numericQuantity],
    (err) => {
      if (err) {
        console.log("ADD PRODUCT INGREDIENT ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      res.json({
        success: true,
        message: "Ingredient added to product recipe"
      });
    }
  );
});

app.delete("/api/product-ingredients/:id", (req, res) => {
  db.query(
    "DELETE FROM product_ingredients WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.log("DELETE PRODUCT INGREDIENT ERROR:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

app.get("/api/costing-analysis", (req, res) => {
  db.query(
    `SELECT
      p.id,
      p.name,
      p.category,
      p.price AS selling_price,
      IFNULL(SUM(pi.quantity * i.price), 0) AS total_cost
     FROM products p
     LEFT JOIN product_ingredients pi ON p.id = pi.product_id
     LEFT JOIN ingredients i ON pi.ingredient_id = i.id
     GROUP BY p.id, p.name, p.category, p.price
     ORDER BY p.id DESC`,
    (err, results) => {
      if (err) {
        console.log("COSTING ANALYSIS ERROR:", err);
        return res.status(500).json([]);
      }

      const analysis = results.map((item) => {
        const sellingPrice = Number(item.selling_price || 0);
        const totalCost = Number(item.total_cost || 0);
        const profit = sellingPrice - totalCost;
        const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

        return {
          id: item.id,
          name: item.name,
          category: item.category,
          selling_price: sellingPrice,
          total_cost: totalCost,
          profit,
          margin
        };
      });

      res.json(analysis);
    }
  );
});

/* ================= CLIENT SIGNUP ================= */

app.post("/api/signup", async (req, res) => {
  const { full_name, email, password, phone, address } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "Full name, email, and password are required."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (full_name, email, password_hash, phone, address) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, phone, address],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already registered." });
          }
          return res.status(500).json({ message: "Database error." });
        }
        res.status(201).json({ message: "Signup successful!" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ================= CLIENT LOGIN ================= */

app.post("/api/client-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error." });
    if (results.length === 0) return res.status(400).json({ message: "Email not found." });

    const user = results[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Incorrect password." });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "YOUR_SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePic: user.profile_pic || ""
      }
    });
  });
});

app.get("/api/getUser", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ user: null });

  jwt.verify(token, "YOUR_SECRET_KEY", (err, decoded) => {
    if (err) return res.json({ user: null });

    db.query("SELECT * FROM users WHERE id = ?", [decoded.id], (err, results) => {
      if (err || results.length === 0) return res.json({ user: null });

      const user = results[0];
      res.json({
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profilePic: user.profile_pic || ""
        }
      });
    });
  });
});

/* ================= GET CLIENT DATA ================= */

app.get("/api/client-data", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, "YOUR_SECRET_KEY", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    db.query(
      "SELECT id, full_name, email, phone, address FROM users WHERE id = ?",
      [decoded.id],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(results[0]);
      }
    );
  });
});

/* ================= ORDERS / AUTO STOCK DEDUCTION ================= */

app.post("/api/orders", (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "No order items provided" });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.log("TRANSACTION START ERROR:", err);
      return res.status(500).json({ success: false, message: "Transaction error" });
    }

    db.query(
      "SELECT id, name FROM shifts WHERE is_active = 1 LIMIT 1",
      (err, shiftRows) => {
        if (err) {
          return db.rollback(() => {
            console.log("FETCH ACTIVE SHIFT ERROR:", err);
            res.status(500).json({ success: false, message: "Failed to fetch active shift" });
          });
        }

        if (shiftRows.length === 0) {
          return db.rollback(() => {
            res.status(400).json({ success: false, message: "No active shift found. Start a new shift first." });
          });
        }

        const activeShiftId = shiftRows[0].id;
        const productIds = items.map((item) => item.product_id);

        db.query(
          "SELECT id, price, name FROM products WHERE id IN (?)",
          [productIds],
          (err, products) => {
            if (err) {
              return db.rollback(() => {
                console.log("FETCH PRODUCTS ERROR:", err);
                res.status(500).json({ success: false, message: "Database error" });
              });
            }

            let total = 0;
            const productMap = {};

            products.forEach((p) => {
              productMap[p.id] = p;
            });

            for (const item of items) {
              const product = productMap[item.product_id];
              if (!product) {
                return db.rollback(() => {
                  res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.product_id}`
                  });
                });
              }

              total += Number(product.price) * Number(item.quantity);
            }

            db.query(
              "INSERT INTO orders (total, shift_id) VALUES (?, ?)",
              [total, activeShiftId],
              (err, orderResult) => {
                if (err) {
                  return db.rollback(() => {
                    console.log("INSERT ORDER ERROR:", err);
                    res.status(500).json({ success: false, message: "Failed to create order" });
                  });
                }

                const orderId = orderResult.insertId;

                db.query(
                  `SELECT 
                    pi.product_id,
                    SUM(pi.quantity * i.price) AS cost
                   FROM product_ingredients pi
                   JOIN ingredients i ON pi.ingredient_id = i.id
                   WHERE pi.product_id IN (?)
                   GROUP BY pi.product_id`,
                  [productIds],
                  (err, costRows) => {
                    if (err) {
                      return db.rollback(() => {
                        console.log("COST FETCH ERROR:", err);
                        res.status(500).json({ success: false, message: "Failed to fetch costs" });
                      });
                    }

                    const costMap = {};
                    costRows.forEach((row) => {
                      costMap[row.product_id] = Number(row.cost || 0);
                    });

                    const orderItemsValues = items.map((item) => {
                      const product = productMap[item.product_id];
                      const price = Number(product.price);
                      const quantity = Number(item.quantity);
                      const cost = Number(costMap[item.product_id] || 0);
                      const subtotal = price * quantity;
                      const profit = (price - cost) * quantity;

                      return [
                        orderId,
                        item.product_id,
                        quantity,
                        price,
                        cost,
                        subtotal,
                        profit
                      ];
                    });

                    db.query(
                      `INSERT INTO order_items
                       (order_id, product_id, quantity, price, cost, subtotal, profit)
                       VALUES ?`,
                      [orderItemsValues],
                      (err) => {
                        if (err) {
                          return db.rollback(() => {
                            console.log("INSERT ORDER ITEMS ERROR:", err);
                            res.status(500).json({ success: false, message: "Failed to save order items" });
                          });
                        }

                        db.query(
                          `SELECT 
                            pi.product_id,
                            pi.ingredient_id,
                            pi.quantity AS recipe_qty,
                            i.stock,
                            i.name AS ingredient_name
                          FROM product_ingredients pi
                          JOIN ingredients i ON pi.ingredient_id = i.id
                          WHERE pi.product_id IN (?)`,
                          [productIds],
                          (err, recipeRows) => {
                            if (err) {
                              return db.rollback(() => {
                                console.log("FETCH RECIPE ERROR:", err);
                                res.status(500).json({ success: false, message: "Failed to fetch recipe data" });
                              });
                            }

                            const stockUpdates = [];

                            for (const item of items) {
                              const matchingRecipes = recipeRows.filter(
                                (r) => Number(r.product_id) === Number(item.product_id)
                              );

                              for (const recipe of matchingRecipes) {
                                const deduction = Number(recipe.recipe_qty) * Number(item.quantity);
                                const newStock = Number(recipe.stock) - deduction;

                                if (newStock < 0) {
                                  return db.rollback(() => {
                                    res.status(400).json({
                                      success: false,
                                      message: `Not enough stock for ingredient: ${recipe.ingredient_name}`
                                    });
                                  });
                                }

                                stockUpdates.push({
                                  ingredient_id: recipe.ingredient_id,
                                  deduction
                                });
                              }
                            }

                            const mergedUpdates = {};

                            stockUpdates.forEach((u) => {
                              if (!mergedUpdates[u.ingredient_id]) {
                                mergedUpdates[u.ingredient_id] = 0;
                              }
                              mergedUpdates[u.ingredient_id] += u.deduction;
                            });

                            const updateEntries = Object.entries(mergedUpdates);
                            let completed = 0;

                            if (updateEntries.length === 0) {
                              return db.commit((err) => {
                                if (err) {
                                  return db.rollback(() => {
                                    console.log("COMMIT ERROR:", err);
                                    res.status(500).json({ success: false, message: "Commit failed" });
                                  });
                                }

                                res.json({
                                  success: true,
                                  message: "Order placed successfully",
                                  order_id: orderId,
                                  total
                                });
                              });
                            }

                            updateEntries.forEach(([ingredientId, deduction]) => {
                              db.query(
                                "UPDATE ingredients SET stock = stock - ? WHERE id = ?",
                                [deduction, ingredientId],
                                (err) => {
                                  if (err) {
                                    return db.rollback(() => {
                                      console.log("UPDATE STOCK ERROR:", err);
                                      res.status(500).json({ success: false, message: "Failed to update stock" });
                                    });
                                  }

                                  completed++;

                                  if (completed === updateEntries.length) {
                                    db.commit((err) => {
                                      if (err) {
                                        return db.rollback(() => {
                                          console.log("COMMIT ERROR:", err);
                                          res.status(500).json({ success: false, message: "Commit failed" });
                                        });
                                      }

                                      res.json({
                                        success: true,
                                        message: "Order placed successfully",
                                        order_id: orderId,
                                        total
                                      });
                                    });
                                  }
                                }
                              );
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});
/* ================= PROFIT INSIGHTS ================= */

app.get("/api/admin/profit-insights", async (req, res) => {
  try {
    const [activeShiftRows] = await db.promise().query(
      "SELECT id, name, started_at FROM shifts WHERE is_active = 1 LIMIT 1"
    );

    if (!activeShiftRows.length) {
      return res.json({
        activeShift: null,
        topProfitable: null,
        leastProfitable: null,
        averageMargin: 0,
        totalProfit: 0,
        dailyRevenue: []
      });
    }

    const activeShift = activeShiftRows[0];
    const shiftId = activeShift.id;

    const [top] = await db.promise().query(
      `SELECT p.name, SUM(oi.profit) AS total_profit
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.shift_id = ?
       GROUP BY p.id, p.name
       ORDER BY total_profit DESC
       LIMIT 1`,
      [shiftId]
    );

    const [least] = await db.promise().query(
      `SELECT p.name, SUM(oi.profit) AS total_profit
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.shift_id = ?
       GROUP BY p.id, p.name
       ORDER BY total_profit ASC
       LIMIT 1`,
      [shiftId]
    );

    const [margin] = await db.promise().query(
      `SELECT ROUND(AVG((oi.profit / NULLIF(oi.subtotal, 0)) * 100), 2) AS avg_margin
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.shift_id = ?`,
      [shiftId]
    );

    const [totalProfit] = await db.promise().query(
      `SELECT ROUND(SUM(oi.profit), 2) AS total_profit
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.shift_id = ?`,
      [shiftId]
    );

    const [dailyRevenue] = await db.promise().query(`
      SELECT DATE(created_at) AS day, SUM(total) AS revenue
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY day DESC
    `);

    const [shiftRevenue] = await db.promise().query(
      `SELECT ROUND(SUM(total), 2) AS total_revenue
       FROM orders
       WHERE shift_id = ?`,
      [shiftId]
    );

    res.json({
      activeShift,
      topProfitable: top[0] || null,
      leastProfitable: least[0] || null,
      averageMargin: margin[0]?.avg_margin || 0,
      totalProfit: totalProfit[0]?.total_profit || 0,
      totalRevenue: shiftRevenue[0]?.total_revenue || 0,
      dailyRevenue: dailyRevenue || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profit insights" });
  }
});

/* ================= START ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.delete("/api/admin/reset-dashboard", (req, res) => {
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Transaction start failed" });
    }

    db.query(
      "SELECT id FROM orders WHERE DATE(created_at) = CURDATE()",
      (err, todayOrders) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ success: false, message: "Failed to get today's orders" });
          });
        }

        if (todayOrders.length === 0) {
          return db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ success: false, message: "Commit failed" });
              });
            }

            res.json({
              success: true,
              message: "No orders found for today"
            });
          });
        }

        const orderIds = todayOrders.map((o) => o.id);

        db.query(
          "DELETE FROM order_items WHERE order_id IN (?)",
          [orderIds],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ success: false, message: "Failed to delete today's order items" });
              });
            }

            db.query(
              "DELETE FROM orders WHERE id IN (?)",
              [orderIds],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ success: false, message: "Failed to delete today's orders" });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ success: false, message: "Commit failed" });
                    });
                  }

                  res.json({
                    success: true,
                    message: "Today's dashboard data reset successfully"
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});
app.post("/api/admin/new-shift", (req, res) => {
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Transaction start failed" });
    }

    db.query(
      "UPDATE shifts SET is_active = 0, ended_at = NOW() WHERE is_active = 1",
      (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ success: false, message: "Failed to close current shift" });
          });
        }

        db.query(
          "SELECT COUNT(*) AS total FROM shifts",
          (err, rows) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ success: false, message: "Failed to count shifts" });
              });
            }

            const nextShiftNumber = Number(rows[0].total || 0) + 1;
            const shiftName = `Shift ${nextShiftNumber}`;

            db.query(
              "INSERT INTO shifts (name, is_active) VALUES (?, 1)",
              [shiftName],
              (err, result) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ success: false, message: "Failed to create new shift" });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ success: false, message: "Commit failed" });
                    });
                  }

                  res.json({
                    success: true,
                    message: `${shiftName} started successfully`,
                    shiftId: result.insertId,
                    shiftName
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});