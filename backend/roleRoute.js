const express = require("express");
const router = express.Router();
const db = require('../db');

// Create a new role
router.post("/", (req, res) => {
  const { role_name } = req.body;
  db.query("INSERT INTO role (role_name) VALUES (?)", [role_name], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(400).send({ message: "Failed to create role" });
      return;
    }

    res.status(201).send({ message: "Role created successfully" });
  });
});

// Get all roles
router.get("/", (req, res) => {
  db.query("SELECT * FROM role", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get a role by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM role WHERE role_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "Role not found" });
      return;
    }

    res.json(rows[0]);
  });
});

// Update a role
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { role_name } = req.body;
  db.query(
    "UPDATE role SET role_name = ? WHERE role_id = ?",
    [role_name, id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Role not found" });
        return;
      }

      res.status(200).send({ message: "Role updated successfully" });
    }
  );
});

// Delete a role
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM role WHERE role_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "Role not found" });
      return;
    }

    res.status(200).send({ message: "Role deleted successfully" });
  });
});

module.exports = router;
