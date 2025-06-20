const express = require("express");
const summaryRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const MonthlyCards = require("../models/monthlyCards");

summaryRouter.get("/monthly-cards", userAuth, async (req, res) => {
  try {
    const user = req.user;
    let cardsData;

    const monthlyCards = await MonthlyCards.findOne({ userId: user._id });
    cardsData = monthlyCards;

    if (!monthlyCards) {
      const newMonthlyCards = new MonthlyCards({ userId: user._id });
      cardsData = await newMonthlyCards.save();
    }

    res.json({
      success: true,
      message: "Monthly Cards Retrieved Successfully",
      data: {
        incomeStats: cardsData.incomeStats,
        spendingStats: cardsData.spendingStats,
      },
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
