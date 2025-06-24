require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const transactionRouter = require("./routes/transaction");
const goalRouter = require("./routes/goal");
const budgetRouter = require("./routes/budget");
const summaryRouter = require("./routes/summary");

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRouter);
app.use("/summary", summaryRouter);
app.use("/transaction", transactionRouter);
app.use("/goal", goalRouter);
app.use("/budget", budgetRouter);

app.use((err, req, res, next) => {
  console.info("Internal Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    log: "" + err.message,
    message: "Internal Server Error",
  });
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
