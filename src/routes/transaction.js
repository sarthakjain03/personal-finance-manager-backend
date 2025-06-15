const express = require("express");
const transactionRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const { validateNewTransactionData } = require("../utils/validations");

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

module.exports = transactionRouter;
