const express = require("express");
const router = express.Router();
const db = require('../db');
const queryAsync = require("../helper");

router.post("/", async (req, res) => {
  const { request_type, request_status, user_id, wastebin_id } = req.body;

  try {
    const [userRows, wastebinRows] = await Promise.all([
      queryAsync("SELECT * FROM users WHERE user_id = ?", [user_id]),
      queryAsync("SELECT * FROM wastebin WHERE wastebin_id = ?", [wastebin_id]),
    ]);

    if (userRows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    if (wastebinRows.length === 0) {
      return res.status(404).send({ message: "Wastebin not found" });
    }

    const insertResult = await queryAsync(
      "INSERT INTO requests (request_type, request_status, user_id, wastebin_id) VALUES (?, ?, ?, ?)",
      [request_type, request_status, user_id, wastebin_id]
    );

    if (insertResult.affectedRows === 0) {
      return res.status(400).send({ message: "Failed to create request" });
    }

    res.status(201).send({ message: "Request created successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});


router.get("/", (req, res) => {
  db.query("SELECT * FROM requests", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

router.get("/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM requests", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json({ total: rows[0].total });
  });
});

router.get("/pending", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS total FROM requests WHERE request_status = 'pending'",
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      res.json({ total: rows[0].total });
    }
  );
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM requests WHERE request_id = ?", [id], (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (rows.length === 0) {
      res.status(404).send({ message: "Request not found" });
      return;
    }

    res.json(rows[0]);
  });
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { request_type, request_status, user_id, wastebin_id } = req.body;

  try {
    const [userRows, wastebinRows] = await Promise.all([
      queryAsync("SELECT * FROM users WHERE user_id = ?", [user_id]),
      queryAsync("SELECT * FROM wastebin WHERE wastebin_id = ?", [wastebin_id]),
    ]);

    if (userRows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    if (wastebinRows.length === 0) {
      return res.status(404).send({ message: "Wastebin not found" });
    }

    const updateResult = await queryAsync(
      "UPDATE requests SET request_type = ?, request_status = ?, user_id = ?, wastebin_id = ? WHERE request_id = ?",
      [request_type, request_status, user_id, wastebin_id, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).send({ message: "Request not found" });
    }

    res.status(200).send({ message: "Request updated successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});


router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM requests WHERE request_id = ?", [id], (err, results) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send({ message: "Request not found" });
      return;
    }

    res.status(200).send({ message: "Request deleted successfully" });
  });
});

module.exports = router;