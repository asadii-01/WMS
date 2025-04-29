const express = require("express");
const router = express.Router();
const db = require('../db');

// Create a new permission
router.post("/", (req, res) => {
  const { permission_name, role_id } = req.body;
  db.query("SELECT * FROM role WHERE role_id = ?", [role_id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "Role not found" });
      return;
    }

    db.query(
      "INSERT INTO permission (permission_name, role_id) VALUES (?, ?)",
      [permission_name, role_id],
      (err, results) => {
        if (err) {
          console.error("error running query: " + err.stack);
          res.status(500).send({ message: "error running query" });
          return;
        }

        if (results.affectedRows === 0) {
          res.status(400).send({ message: "Failed to create permission" });
          return;
        }

        res.status(201).send({ message: "permission created successfully" });
      }
    );
  });
});

// Get all permissions
router.get("/", (req, res) => {
  db.query("SELECT * FROM permission", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get a permission by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM permission WHERE permission_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "permission not found" });
      return;
    }

    res.json(rows[0]);
  });
});

// Update a permission
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { permission_name, role_id } = req.body;
  db.query(
    "SELECT * FROM role WHERE role_id = ?",
    [role_id],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "role not found" });
        return;
      }

      db.query(
        "UPDATE permission SET permission_name = ?, role_id = ? WHERE permission_id = ?",
        [permission_name, role_id, id],
        (err, results) => {
          if (err) {
            console.error("error running query: " + err.stack);
            res.status(500).send({ message: "error running query" });
            return;
          }

          if (results.affectedRows === 0) {
            res.status(404).send({ message: "permission not found" });
            return;
          }

          res.status(200).send({ message: "permission updated successfully" });
        }
      );
    }
  );
});

// Delete a permission
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM permission WHERE permission_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "permission not found" });
      return;
    }

    res.status(200).send({ message: "permission deleted successfully" });
  });
});

module.exports = router;
