  const express = require("express");
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");

  const router = express.Router();
  const pool = require("../db");

  router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required.",
        });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          message: "Email already registered.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );

      res.status(201).json({
        message: "User registered successfully.",
        user: result.rows[0],
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Server error.",
      });
    }
  });


  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required.",
        });
      }

      // Find user
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }

      const user = result.rows[0];

      // Compare password
      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password.",
        });
      }
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.json({
    message: "Login successful.",
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error.",
      });
    }
  });



  module.exports = router;