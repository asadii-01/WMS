const express = require("express");
const router = express.Router();
const db = require('../db');

// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(401).send({ message: "Invalid credentials" });
        return;
      }

      res.status(200).send({ message: "Login successful", user: rows[0] });
    }
  );
});

// Register route
router.post("/register", (req, res) => {
  const { firstname, lastname, email, phone, address, usertype, password } = req.body;
  const username = `${firstname} ${lastname}`;

  db.query(
    "SELECT * FROM role WHERE role_name = ?",
    [usertype],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "Role not found" });
        return;
      }

      const roleId = rows[0].role_id;

      db.query(
        "INSERT INTO users (username, email, phone_no, address, password, role_id) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, phone, address, password, roleId],
        (err, results) => {
          if (err) {
            console.error("error running query: " + err.stack);
            res.status(500).send({ message: "error running query" });
            return;
          }

          if (results.affectedRows === 0) {
            res.status(400).send({ message: "Failed to create user" });
            return;
          }

          res.status(201).send({ message: "User created successfully" });
        }
      );
    }
  );
});


// Get user by ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM users WHERE user_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "user not found" });
      return;
    }

    res.json(rows[0]);
  });
});

// Get all users
router.get("/", (req, res) => {
  db.query("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Update user
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { username, email, password, role_id } = req.body;
  db.query(
    "UPDATE users SET username = ?, email = ?, password = ?, role_id = ? WHERE user_id = ?",
    [username, email, password, role_id, id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "user not found" });
        return;
      }

      res.status(200).send({ message: "user updated successfully" });
    }
  );
});

// Delete user
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM users WHERE user_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "user not found" });
      return;
    }

    res.status(200).send({ message: "user deleted successfully" });
  });
});

module.exports = router;