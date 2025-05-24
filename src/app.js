require("dotenv").config();
const express = require("express");
const validator = require("validator");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).send({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    if (!validator.isEmail(email)) {
      res.status(400).send({
        success: false,
        message: "Invalid email address",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      res.status(400).send({
        success: false,
        message: "User already Registered",
      });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.send({
      success: true,
      message: "User created successfully!",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error creating user: " + error?.message,
    });
  }
});

app.get("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    if (!validator.isEmail(email)) {
      res.status(400).send({
        success: false,
        message: "Invalid email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send({
        success: false,
        message: "User is not Registered",
      });
    }
    if (user?.password !== password) {
      res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    res.send({
      success: true,
      message: "User Logged In Successfully",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error logging in: " + error?.message,
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
