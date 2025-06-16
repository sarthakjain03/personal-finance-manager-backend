const express = require("express");
const transactionRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const {
  validateNewTransactionData,
  validateEditTransactionData,
} = require("../utils/validations");

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

    let data;
    const userTransactions = await Transaction.findOne({ userId: user._id });
    if (userTransactions) {
      const updateUserTransactions = await Transaction.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          $push: { transactions: newTransaction },
        },
        {
          new: true,
        }
      );

      data = updateUserTransactions.transactions;
    } else {
      const firstUserTransaction = new Transaction({
        userId: user._id,
        transactions: [{ ...newTransaction }],
      });

      const newUserEntry = await firstUserTransaction.save();
      data = newUserEntry.transactions;
    }

    const balanceUpdate = transactionType === "Income" ? amount : -amount;
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $inc: { currentBalance: balanceUpdate },
      },
      { new: true }
    ).select("currentBalance");

    res.json({
      success: true,
      message: "Transaction added successfully",
      data: {
        transactions: data,
        currentBalance: updatedUser.currentBalance,
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

    const userTransactions = await Transaction.findOne({ userId: user._id });
    if (!userTransactions) {
      return res.status(404).json({
        success: false,
        message: "User transactions not found",
      });
    }

    const transaction = userTransactions.transactions.id(transactionId);
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

    await userTransactions.save();

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
      {
        new: true,
      }
    ).select("currentBalance");

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: {
        // transactions: userTransactions.transactions,
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

transactionRouter.delete("/:id", userAuth, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const user = req.user;

    const userTransactions = await Transaction.findOne({ userId: user._id });
    if (!userTransactions) {
      return res.status(404).json({
        success: false,
        message: "User transactions not found",
      });
    }

    const transaction = userTransactions.transactions.id(transactionId);
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

    transaction.deleteOne();
    await userTransactions.save();

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
