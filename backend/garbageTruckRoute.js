const express = require("express");
const router = express.Router();
const db = require("../db");

// Create a new garbage truck
router.post("/", (req, res) => {
  const { truck_capacity, truck_status, license_plate } = req.body;
  db.query(
    "INSERT INTO garbagetruck (truck_capacity, truck_status, license_plate) VALUES (?, ?, ?)",
    [truck_capacity, truck_status, license_plate],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(400).send({ message: "Failed to create garbage truck" });
        return;
      }

      res.status(201).send({ message: "Garbage truck created successfully" });
    }
  );
});

// Get all garbage trucks
router.get("/", (req, res) => {
  db.query("SELECT * FROM garbagetruck", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get total number of garbage trucks
router.get("/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM garbagetruck", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json({ total: rows[0].total });
  });
});

// Get a garbage truck by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM garbagetruck WHERE truck_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "Garbage truck not found" });
        return;
      }

      res.json(rows[0]);
    }
  );
});

// Update a garbage truck
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { truck_capacity, truck_status, license_plate } = req.body;
  db.query(
    "UPDATE garbagetruck SET truck_capacity = ?, truck_status = ?, license_plate = ? WHERE truck_id = ?",
    [truck_capacity, truck_status, license_plate, id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Garbage truck not found" });
        return;
      }

      res.status(200).send({ message: "Garbage truck updated successfully" });
    }
  );
});

// Delete a garbage truck
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM garbagetruck WHERE truck_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Garbage truck not found" });
        return;
      }

      res.status(200).send({ message: "Garbage truck deleted successfully" });
    }
  );
});

module.exports = router;
