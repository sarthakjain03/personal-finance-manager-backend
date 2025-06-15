require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const transactionRouter = require("./routes/transaction");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/transaction", transactionRouter);

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
