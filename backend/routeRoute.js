const express = require("express");
const router = express.Router();
const db = require("../db");

// Create a new route
router.post("/", (req, res) => {
  const { route_name, optimized_path } = req.body;
  db.query(
    "INSERT INTO route (route_name, optimized_path) VALUES (?, ?)",
    [route_name, optimized_path],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(400).send({ message: "Failed to create route" });
        return;
      }

      res.status(201).send({ message: "Route created successfully" });
    }
  );
});

// Get all routes
router.get("/", (req, res) => {
  db.query("SELECT * FROM route", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get total number of routes
router.get("/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM route", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json({ total: rows[0].total });
  });
});

// Get a route by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM route WHERE route_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "Route not found" });
      return;
    }

    res.json(rows[0]);
  });
});

// Update a route
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { route_name, optimized_path } = req.body;
  db.query(
    "UPDATE route SET route_name = ?, optimized_path = ? WHERE route_id = ?",
    [route_name, optimized_path, id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Route not found" });
        return;
      }

      res.status(200).send({ message: "Route updated successfully" });
    }
  );
});

// Delete a route
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM route WHERE route_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "Route not found" });
      return;
    }

    res.status(200).send({ message: "Route deleted successfully" });
  });
});

module.exports = router;

