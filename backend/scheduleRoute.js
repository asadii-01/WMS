const express = require("express");
const router = express.Router();
const db = require("../db");
const queryAsync = require("../helper");

// Create a new collection schedule
router.post("/", async (req, res) => {
  const { collection_time, wastebin_id, truck_id } = req.body;

  try {
    const [wastebinRows, truckRows] = await Promise.all([
      queryAsync("SELECT * FROM wastebin WHERE wastebin_id = ?", [wastebin_id]),
      queryAsync("SELECT * FROM garbagetruck WHERE truck_id = ?", [truck_id]),
    ]);

    if (wastebinRows.length === 0) {
      return res.status(404).send({ message: "Wastebin not found" });
    }

    if (truckRows.length === 0) {
      return res.status(404).send({ message: "Garbage truck not found" });
    }

    const insertResult = await queryAsync(
      "INSERT INTO collectionschedule (collection_time, wastebin_id, truck_id) VALUES (?, ?, ?)",
      [collection_time, wastebin_id, truck_id]
    );

    if (insertResult.affectedRows === 0) {
      return res
        .status(400)
        .send({ message: "Failed to create collection schedule" });
    }

    res
      .status(201)
      .send({ message: "Collection schedule created successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Get all collection schedules
router.get("/", (req, res) => {
  db.query("SELECT * FROM collectionschedule", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

// Get a collection schedule by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM collectionschedule WHERE schedule_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "Collection schedule not found" });
        return;
      }

      res.json(rows[0]);
    }
  );
});

// Delete a collection schedule
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM collectionschedule WHERE schedule_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "Collection schedule not found" });
        return;
      }

      res
        .status(200)
        .send({ message: "Collection schedule deleted successfully" });
    }
  );
});

// Update a collection schedule
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { collection_time, wastebin_id, truck_id } = req.body;

  try {
    const [wastebinRows, truckRows] = await Promise.all([
      queryAsync("SELECT * FROM wastebin WHERE wastebin_id = ?", [wastebin_id]),
      queryAsync("SELECT * FROM garbagetruck WHERE truck_id = ?", [truck_id]),
    ]);

    if (wastebinRows.length === 0) {
      return res.status(404).send({ message: "Wastebin not found" });
    }

    if (truckRows.length === 0) {
      return res.status(404).send({ message: "Garbage truck not found" });
    }

    const updateResult = await queryAsync(
      "UPDATE collectionschedule SET collection_time = ?, wastebin_id = ?, truck_id = ? WHERE schedule_id = ?",
      [collection_time, wastebin_id, truck_id, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).send({ message: "Collection schedule not found" });
    }

    res
      .status(200)
      .send({ message: "Collection schedule updated successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
