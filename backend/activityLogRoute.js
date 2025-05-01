const express = require("express");
const router = express.Router();
const db = require('../db');

// Create a new activity log
router.post("/", (req, res) => {
  const { action, timestamp, user_id } = req.body;

  db.query("SELECT * FROM users WHERE user_id = ?", [user_id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    db.query(
      "INSERT INTO activityLog (action, timestamp, user_id) VALUES (?, ?, ?)",
      [action, timestamp, user_id],
      (err, results) => {
        if (err) {
          console.error("error running query: " + err.stack);
          res.status(500).send({ message: "error running query" });
          return;
        }

        res.status(201).send({ message: "Activity log created successfully" });
      }
    );
  });
});

// Get all activity logs
router.get("/", (req, res) => {
  db.query("SELECT * FROM activityLog", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get activity log by ID
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM activityLog WHERE log_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "Activity log not found" });
      return;
    }

    res.json(rows[0]);
  });
});

// Delete an activity log
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM activityLog WHERE log_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "Activity log not found" });
      return;
    }

    res.status(200).send({ message: "Activity log deleted successfully" });
  });
});

module.exports = router;

