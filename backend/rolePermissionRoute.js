const express = require("express");
const router = express.Router();
const db = require("../db");
const queryAsync = require("../helper");

router.post("/", async (req, res) => {
  const { role_id, permission_id } = req.body;

  try {
    const [roleRows, permissionRows] = await Promise.all([
      queryAsync("SELECT * FROM role WHERE role_id = ?", [role_id]),
      queryAsync("SELECT * FROM permission WHERE permission_id = ?", [
        permission_id,
      ]),
    ]);

    if (roleRows.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    if (permissionRows.length === 0) {
      return res.status(404).send({ message: "Wastebin not found" });
    }

    const insertResult = await queryAsync(
      "INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)",
      [role_id, permission_id]
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
  db.query("SELECT * FROM role_permission", (err, rows) => {
    if (err) {
      console.error("error running query: " + err.stack);
      res.status(500).send({ message: "error running query" });
      return;
    }

    res.json(rows);
  });
});

router.get("/:role_id/:permission_id", (req, res) => {
  const role_id = req.params.role_id;
  const permission_id = req.params.permission_id;
  db.query(
    "SELECT * FROM role_permission WHERE role_id = ? AND permission_id = ?",
    [role_id, permission_id],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "role_permission not found" });
        return;
      }

      res.json(rows[0]);
    }
  );
});

router.get("/:permission_id", (req, res) => {
  const permission_id = req.params.permission_id;
  db.query(
    "SELECT * FROM role_permission WHERE permission_id = ?",
    [permission_id],
    (err, rows) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (rows.length === 0) {
        res.status(404).send({ message: "role_permission not found" });
        return;
      }

      res.json(rows);
    }
  );
});

router.delete("/", (req, res) => {
  const { role_id, permission_id } = req.body;
  db.query(
    "DELETE FROM role_permission WHERE role_id = ? AND permission_id = ?",
    [role_id, permission_id],
    (err, results) => {
      if (err) {
        console.error("error running query: " + err.stack);
        res.status(500).send({ message: "error running query" });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).send({ message: "role_permission not found" });
        return;
      }

      res.status(200).send({ message: "role_permission deleted successfully" });
    }
  );
});

module.exports = router;
