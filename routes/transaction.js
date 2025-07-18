const express = require("express");
const transactionRouter = express.Router();

const { userAuth } = require("../src/middlewares/auth");
const Transaction = require("../models/transaction");
const Budget = require("../models/budget");
const User = require("../models/user");
const {
  validateNewTransactionData,
  validateEditTransactionData,
  validateGetTransactionsData,
} = require("../utils/validations");

const findAndUpdateBudget = async (user, category, amount) => {
  const budget = await Budget.findOne({ userId: user._id, category });
  if (budget) {
    const newSpentAmount = budget.spentAmount + amount;
    const newRemainingAmount = budget.remainingAmount - amount;
    const newSpentPercentage = parseFloat(
      ((newSpentAmount / budget.budgetAmount) * 100).toFixed(2)
    );

    budget.spentAmount = newSpentAmount;
    budget.remainingAmount = newRemainingAmount;
    budget.spentPercentage = newSpentPercentage;

    await budget.save();
  }
};

transactionRouter.post("/all", userAuth, async (req, res) => {
  try {
    validateGetTransactionsData(req);

    const user = req.user;
    const page = req.body.page ? parseInt(req.body.page) : 1;
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    limit = limit > 20 ? 20 : limit;
    const offset = (page - 1) * limit;

    const { category, type, fromDate, toDate, search } = req.body;

    const userTransactions = await Transaction.find({ userId: user._id })
      .skip(offset)
      .limit(limit);

    const filteredTransactions = userTransactions.filter((transaction) => {
      const matchesCategory = category
        ? transaction.category === category
        : true;
      const matchesType = type ? transaction.transactionType === type : true;
      const matchesFromDate = fromDate
        ? new Date(transaction.date) >= new Date(fromDate)
        : true;
      const matchesToDate = toDate
        ? new Date(transaction.date) <= new Date(toDate)
        : true;
      const matchesSearch = search
        ? [
            transaction.description,
            transaction.category,
            transaction.transactionType,
          ].some((field) => field?.toLowerCase().includes(search.toLowerCase()))
        : true;

      return (
        matchesCategory &&
        matchesType &&
        matchesFromDate &&
        matchesToDate &&
        matchesSearch
      );
    });

    res.json({
      success: true,
      message: "Transactions fetched successfully",
      data: filteredTransactions,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "" + error?.message,
    });
  }
});

transactionRouter.post("/new", userAuth, async (req, res) => {
  try {
    validateNewTransactionData(req);

    const { description, category, transactionType, amount, date } = req.body;
    const user = req.user;
    const newTransaction = {
      description,
      category,
      transactionType,
      amount,
      date,
    };

    if (transactionType === "Expense" && user.currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Balance",
      });
    }

    const userNewTransaction = new Transaction({
      userId: user._id,
      ...newTransaction,
    });

    await userNewTransaction.save();

    if (transactionType === "Expense") {
      await findAndUpdateBudget(user, category, amount);
    }

    const balanceUpdate = transactionType === "Income" ? amount : -amount;
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $inc: { currentBalance: balanceUpdate },
      },
      { new: true, runValidators: true }
    ).select("currentBalance");

    res.json({
      success: true,
      message: "Transaction added successfully",
      data: {
        currentBalance: updatedUser.currentBalance,
        transaction: userNewTransaction,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "" + error?.message,
    });
  }
});

transactionRouter.patch("/edit/:id", userAuth, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const user = req.user;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    validateEditTransactionData(req, transaction);

    const { description, category, transactionType, amount, date } = req.body;
    const oldAmount = transaction.amount;
    const oldType = transaction.transactionType;

    if (transactionType !== undefined)
      transaction.transactionType = transactionType;
    if (description !== undefined) transaction.description = description;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = date;
    if (amount !== undefined) transaction.amount = amount;

    if (
      transaction.transactionType === "Expense" &&
      user.currentBalance < transaction.amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Insufficient Balance",
      });
    }

    await transaction.save();

    if (transactionType || category || amount) {
      let updatedAmount = transaction.amount;
      if (transactionType === "Income") updatedAmount = -transaction.amount;
      await findAndUpdateBudget(user, transaction.category, updatedAmount);
    }

    let changeInAmount = 0;
    const newAmount = transaction.amount;
    const newType = transaction.transactionType;

    if (oldType === "Income") changeInAmount -= oldAmount;
    else changeInAmount += oldAmount;

    if (newType === "Income") changeInAmount += newAmount;
    else changeInAmount -= newAmount;

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $inc: { currentBalance: changeInAmount },
      },
      { new: true, runValidators: true }
    ).select("currentBalance");

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: {
        currentBalance: updatedUser.currentBalance,
        transaction,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error?.message,
    });
  }
});

transactionRouter.delete("/delete/:id", userAuth, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const user = req.user;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: user._id,
    });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const deletedTransactionType = transaction.transactionType;
    const deletedAmount =
      deletedTransactionType === "Income"
        ? -transaction.amount
        : transaction.amount;

    if (deletedTransactionType === "Expense") {
      await findAndUpdateBudget(user, transaction.category, transaction.amount);
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $inc: { currentBalance: deletedAmount },
      },
      {
        new: true,
      }
    ).select("currentBalance");

    await Transaction.deleteOne({ _id: transactionId, userId: user._id });

    res.json({
      success: true,
      message: "Transaction deleted successfully",
      data: {
        currentBalance: updatedUser.currentBalance,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error?.message,
    });
  }
});

module.exports = transactionRouter;
