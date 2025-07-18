const express = require("express");
const budgetRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Budget = require("../models/budget");
const {
  validateNewBudgetData,
  validateEditBudgetData,
} = require("../../utils/validations");
const Transaction = require("../models/transaction");

const updateTotalsAndSend = async (user, res, budget, successMessage) => {
  let totalBudget = 0;
  let totalSpent = 0;
  let totalRemaining = 0;
  let totalSpentPercentage = 0;

  if (user) {
    const totalAmounts = await Budget.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$budgetAmount" },
          totalSpent: { $sum: "$spentAmount" },
          totalRemaining: { $sum: "$remainingAmount" },
        },
      },
    ]);

    const percentageSpent = totalAmounts?.[0]?.totalSpent
      ? totalAmounts[0]?.totalSpent / totalAmounts[0]?.totalBudget
      : 0;

    totalBudget = totalAmounts?.[0]?.totalBudget || 0;
    totalSpent = totalAmounts?.[0]?.totalSpent || 0;
    totalRemaining = totalAmounts?.[0]?.totalRemaining || 0;
    totalSpentPercentage = percentageSpent * 100;

    return res.json({
      success: true,
      message: successMessage,
      data: {
        budget,
        totalBudget,
        totalSpent,
        totalRemaining,
        totalSpentPercentage,
      },
    });
  }

  throw new Error("User is undefined or null");
};

budgetRouter.get("/all", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const budgets = await Budget.find({ userId: user._id });

    await updateTotalsAndSend(
      user,
      res,
      budgets,
      "Budgets retrieved successfully"
    );
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

budgetRouter.post("/new", userAuth, async (req, res) => {
  try {
    validateNewBudgetData(req);

    const user = req.user;
    const { category, budgetAmount } = req.body;

    const currentBudgets = await Budget.find({ userId: user._id });
    const usedCategories = currentBudgets.map((budget) => budget.category);

    if (usedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Budget for this category is already set",
      });
    }

    const userSpends = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          category,
          transactionType: "Expense",
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const spentAmount = userSpends?.[0]?.totalSpent || 0;
    const percentageSpent = parseFloat(
      ((spentAmount / budgetAmount) * 100).toFixed(2)
    );

    const newBudget = new Budget({
      userId: user._id,
      category,
      budgetAmount,
      spentAmount,
      remainingAmount: budgetAmount - spentAmount,
      spentPercentage: percentageSpent,
    });

    await newBudget.save();

    await updateTotalsAndSend(
      user,
      res,
      newBudget,
      "Budget added successfully"
    );
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

budgetRouter.patch("/edit/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const budgetId = req.params.id;

    const budget = await Budget.findOne({ _id: budgetId, userId: user._id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    validateEditBudgetData(req, budget);

    const { category, budgetAmount } = req.body;

    if (category !== undefined) budget.category = category;
    if (budgetAmount !== undefined) {
      budget.budgetAmount = budgetAmount;
      const spentPercentage = parseFloat(
        ((budget.spentAmount / budgetAmount) * 100).toFixed(2)
      );
      budget.spentPercentage = spentPercentage;
      budget.remainingAmount = budgetAmount - budget.spentAmount;
    }

    await budget.save();

    await updateTotalsAndSend(user, res, budget, "Budget updated successfully");
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

budgetRouter.delete("/delete/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const budgetId = req.params.id;

    const budget = await Budget.findOne({ _id: budgetId, userId: user._id });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await Budget.deleteOne({ _id: budgetId, userId: user._id });

    await updateTotalsAndSend(
      user,
      res,
      undefined,
      "Budget deleted successfully"
    );
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

budgetRouter.patch("/reset", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const newMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    await Budget.updateMany(
      { userId: user._id, createdAt: { $lt: newMonthStart } },
      [
        {
          $set: {
            spentAmount: 0,
            spentPercentage: 0,
            remainingAmount: "$budgetAmount",
          },
        },
      ]
    );

    res.json({
      success: true,
      message: "Budgets reset successful",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

module.exports = budgetRouter;
