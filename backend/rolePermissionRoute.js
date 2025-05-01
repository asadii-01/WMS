const express = require("express");
const router = express.Router();
const db = require("../db");
const queryAsync = require("../helper");

// Create a new role permission
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
      return res.status(404).send({ message: "Role not found" });
    }

    if (permissionRows.length === 0) {
      return res.status(404).send({ message: "Permission not found" });
    }

    const insertResult = await queryAsync(
      "INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)",
      [role_id, permission_id]
    );

    if (insertResult.affectedRows === 0) {
      return res.status(400).send({ message: "Failed to create role permission" });
    }

    res.status(201).send({ message: "Role permission created successfully" });
  } catch (error) {
    console.error("Error running query:", error.stack);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Get all role permissions
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

// Get a role permission by role id and permission id
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
        res.status(404).send({ message: "Role permission not found" });
        return;
      }

      res.json(rows[0]);
    }
  );
});

// Get all role permissions by permission id
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
        res.status(404).send({ message: "Role permission not found" });
        return;
      }

      res.json(rows);
    }
  );
});

// Delete a role permission
router.delete("/:permission_id/:role_id", (req, res) => {
  const role_id = req.params.role_id;
  const permission_id = req.params.permission_id;
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
        res.status(404).send({ message: "Role permission not found" });
        return;
      }

      res.status(200).send({ message: "Role permission deleted successfully" });
    }
  );
});

module.exports = router;

