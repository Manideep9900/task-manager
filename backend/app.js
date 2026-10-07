const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/tasks");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Task Manager Backend is running!");
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is healthy",
  });
});

// Task routes
app.use("/tasks", taskRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});