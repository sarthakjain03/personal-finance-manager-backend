require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");

const User = require("./models/user");

const app = express();

app.post("/signup", async (req, res) => {
  const newUser = new User({
    name: "Test User",
    email: "test@test.com",
    password: "test123",
  });

  try {
    await newUser.save();
    res.send({
      success: true,
      message: "User created successfully!",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error creating user",
    });
  }
});

connectDB()
  .then(() => {
    console.log("Connected to database successfully!");
    app.listen(7777, () => {
      console.log("Server is running on port 7777...");
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });
