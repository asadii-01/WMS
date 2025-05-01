const express = require("express");
const router = express.Router();
const db = require("../db");
const queryAsync = require("../helper");

// Create a new collection
router.post("/", async (req, res) => {
  const { completion_status, schedule_id, route_id } = req.body;

  try {
    // Check if schedule_id and route_id exist simultaneously
    const [scheduleRows, routeRows] = await Promise.all([
      queryAsync("SELECT * FROM collectionschedule WHERE schedule_id = ?", [
        schedule_id,
      ]),
      queryAsync("SELECT * FROM route WHERE route_id = ?", [route_id]),
    ]);

    if (scheduleRows.length === 0) {
      return res.status(404).send({ message: "Collection schedule not found" });
    }

    if (routeRows.length === 0) {
      return res.status(404).send({ message: "Route not found" });
    }

    // If both exist, insert the collection
    const insertResult = await queryAsync(
      "INSERT INTO collection (completion_status, schedule_id, route_id) VALUES (?, ?, ?)",
      [completion_status, schedule_id, route_id]
    );

    if (insertResult.affectedRows === 0) {
      return res.status(400).send({ message: "Failed to create collection" });
    }

    res.status(201).send({ message: "Collection created successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Get all collections
router.get("/", (req, res) => {
  db.query("SELECT * FROM collection", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get total number of collections
router.get("/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM collection", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json({ total: rows[0].total });
  });
});

// Get total number of completed collections
router.get("/completed", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS total FROM collection WHERE completion_status = 'completed'",
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

// Get a collection by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM collection WHERE collection_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "Collection not found" });
        return;
      }

      res.json(rows[0]);
    }
  );
});

// Update a collection
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { completion_status, schedule_id, route_id } = req.body;

  try {
    // Check if schedule_id and route_id exist simultaneously
    const [scheduleRows, routeRows] = await Promise.all([
      queryAsync("SELECT * FROM collectionschedule WHERE schedule_id = ?", [
        schedule_id,
      ]),
      queryAsync("SELECT * FROM route WHERE route_id = ?", [route_id]),
    ]);

    if (scheduleRows.length === 0) {
      return res.status(404).send({ message: "Collection schedule not found" });
    }

    if (routeRows.length === 0) {
      return res.status(404).send({ message: "Route not found" });
    }

    // If both exist, update the collection
    const updateResult = await queryAsync(
      "UPDATE collection SET completion_status = ?, schedule_id = ?, route_id = ? WHERE collection_id = ?",
      [completion_status, schedule_id, route_id, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).send({ message: "Collection not found" });
    }

    res.status(200).send({ message: "Collection updated successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Delete a collection
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM collection WHERE collection_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Collection not found" });
        return;
      }

      res.status(200).send({ message: "Collection deleted successfully" });
    }
  );
});

module.exports = router;
