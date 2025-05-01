const express = require("express");
const router = express.Router();
const db = require('../db');

// Create a new wastebin
router.post("/", (req, res) => {
  const { bin_location, bin_status, bin_capacity } = req.body;
  db.query(
    "INSERT INTO wastebin (bin_location, bin_status, bin_capacity) VALUES (?, ?, ?)",
    [bin_location, bin_status, bin_capacity],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(400).send({ message: "Failed to create wastebin" });
        return;
      }

      res.status(201).send({ message: "wastebin created successfully" });
    }
  );
});

// Get all wastebins
router.get("/", (req, res) => {
  db.query("SELECT * FROM wastebin", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get total number of wastebins
router.get("/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM wastebin", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json({ total: rows[0].total });
  });
});

// Get a wastebin by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM wastebin WHERE wastebin_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "wastebin not found" });
      return;
    }

    res.json(rows[0]);
  });
});

// Update a wastebin
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { bin_location, bin_status, bin_capacity } = req.body;
  db.query(
    "UPDATE wastebin SET bin_location = ?, bin_status = ?, bin_capacity = ? WHERE wastebin_id = ?",
    [bin_location, bin_status, bin_capacity, id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "wastebin not found" });
        return;
      }

      res.status(200).send({ message: "wastebin updated successfully" });
    }
  );
});

// Delete a wastebin
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM wastebin WHERE wastebin_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "wastebin not found" });
      return;
    }

    res.status(200).send({ message: "wastebin deleted successfully" });
  });
});

module.exports = router;
