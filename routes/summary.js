const express = require("express");
const summaryRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");
const {
  getPercentageChange,
  getTrendsChartData,
} = require("../../utils/helpers");
const {
  validateTrendData,
  validateCategoryWiseExpensesData,
} = require("../../utils/validations");
const { Timelines } = require("../../utils/constants");

summaryRouter.get("/monthly-cards", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const cardData = { currentMonth: 0, lastMonth: 0, percentChange: 0 };
    const incomeStats = { ...cardData };
    const spendingStats = { ...cardData };

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const userStats = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: startOfLastMonth },
        },
      },
      {
        $project: {
          amount: 1,
          transactionType: 1,
          isCurrentMonth: {
            $gte: ["$date", startOfCurrentMonth],
          },
          isLastMonth: {
            $and: [
              { $gte: ["$date", startOfLastMonth] },
              { $lt: ["$date", endOfLastMonth] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$transactionType",
          currentMonth: {
            $sum: {
              $cond: ["$isCurrentMonth", "$amount", 0],
            },
          },
          lastMonth: {
            $sum: {
              $cond: ["$isLastMonth", "$amount", 0],
            },
          },
        },
      },
    ]);

    userStats.forEach((item) => {
      if (item._id === "Income") {
        incomeStats.currentMonth = item.currentMonth;
        incomeStats.lastMonth = item.lastMonth;
      } else {
        spendingStats.currentMonth = item.currentMonth;
        spendingStats.lastMonth = item.lastMonth;
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

summaryRouter.get("/trend/:type", userAuth, async (req, res) => {
  try {
    validateTrendData(req);

    const user = req.user;

    const type = req.params.type[0].toUpperCase() + req.params.type.slice(1);
    const timeline = req.query.timeline;

    const userTransactions = await Transaction.find({
      userId: user._id,
      transactionType: type,
    }).select("transactionType amount date");

    const trendsChartData = getTrendsChartData(userTransactions, timeline);

    res.json({
      success: true,
      message: "Trends data fetched successfully",
      data: trendsChartData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

summaryRouter.get("/category-wise-expenses", userAuth, async (req, res) => {
  try {
    validateCategoryWiseExpensesData(req);

    const user = req.user;
    const timeline = req.query.timeline;

    const startYear = new Date().getFullYear();
    const endYear = timeline === Timelines[0] ? startYear : startYear + 1;
    const startMonth = new Date().getMonth();
    const endMonth = timeline === Timelines[0] ? startMonth + 1 : 0;

    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(endYear, endMonth, 1);

    const categoryWiseExpensesData = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          transactionType: "Expense",
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          value: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1,
        },
      },
    ]);

    res.json({
      success: true,
      message: "Category wise expenses data fetched successfully",
      data: categoryWiseExpensesData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

summaryRouter.get("/budget", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const userBudgets = await Budget.find({ userId: user._id }).select(
      "category spentAmount budgetAmount"
    );

    res.json({
      success: true,
      message: "Budget summary fetched successfully",
      data: userBudgets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

module.exports = summaryRouter;
