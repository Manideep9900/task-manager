const express = require("express");
const router = express.Router();

const pool = require("../db");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
});

// POST create a new task
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    // Validate title
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
});

// PUT update a task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // Validate title
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    const result = await pool.query(
      "UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *",
      [title.trim(), completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
});

module.exports = router;