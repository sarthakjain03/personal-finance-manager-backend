const express = require("express");
const transactionRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const {
  validateNewTransactionData,
  validateEditTransactionData,
} = require("../utils/validations");

transactionRouter.get("/all", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 20;
    limit = limit > 20 ? 20 : limit;
    const offset = (page - 1) * limit;

    const userTransactions = await Transaction.find({ userId: user._id })
      .skip(offset)
      .limit(limit);

    res.json({
      success: true,
      message: "Transactions fetched successfully",
      data: userTransactions,
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

    const userNewTransaction = new Transaction({
      userId: user._id,
      ...newTransaction,
    });

    await userNewTransaction.save();

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

    await transaction.save();

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

    const transaction = await Transaction.findById(transactionId);
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

    await Transaction.deleteOne({ _id: transactionId });

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
