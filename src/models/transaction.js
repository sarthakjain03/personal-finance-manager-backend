const mongoose = require("mongoose");

const singleTransactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  transactionType: {
    type: String,
    required: true,
    enum: ["Income", "Expense"],
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    required: true,
  },
});

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactions: {
    type: [singleTransactionSchema],
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
