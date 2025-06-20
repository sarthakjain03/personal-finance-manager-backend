const express = require("express");
const summaryRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Transaction = require("../models/transaction");
const { getPercentageChange } = require("../utils/helpers");

const getIncrementalAmount = (transaction, monthType) => {
  const subtractMonth = monthType === "current" ? 0 : 1;
  const requiredMonth = new Date().getMonth() - subtractMonth;
  const month = transaction.date.getMonth();

  return month === requiredMonth ? transaction.amount : 0;
};

summaryRouter.get("/monthly-cards", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const cardData = { currentMonth: 0, lastMonth: 0, percentChange: 0 };
    const incomeStats = { ...cardData };
    const spendingStats = { ...cardData };

    const userTransactions = await Transaction.find({
      userId: user._id,
    }).select("transactionType amount date");

    userTransactions.forEach((transaction) => {
      const currentMonthAmount = getIncrementalAmount(transaction, "current");
      const lastMonthAmount = getIncrementalAmount(transaction, "last");
      if (transaction.transactionType === "Income") {
        incomeStats.currentMonth += currentMonthAmount;
        incomeStats.lastMonth += lastMonthAmount;
      } else {
        spendingStats.currentMonth += currentMonthAmount;
        spendingStats.lastMonth += lastMonthAmount;
      }
    });

    incomeStats.percentChange = getPercentageChange(
      incomeStats.currentMonth,
      incomeStats.lastMonth
    );
    spendingStats.percentChange = getPercentageChange(
      spendingStats.currentMonth,
      spendingStats.lastMonth
    );

    res.json({
      success: true,
      message: "Monthly cards data fetched successfully",
      data: { incomeStats, spendingStats },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

summaryRouter.get("/", userAuth, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

summaryRouter.get("/", userAuth, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

summaryRouter.get("/", userAuth, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

summaryRouter.get("/", userAuth, async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

module.exports = summaryRouter;
