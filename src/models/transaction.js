const mongoose = require("mongoose");

const {
  TransactionTypes,
  ExpenseCategories,
  IncomeCategories,
} = require("../utils/constants");

const AllCategories = [...ExpenseCategories, ...IncomeCategories];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: AllCategories,
    },
    transactionType: {
      type: String,
      required: true,
      enum: TransactionTypes,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.userId;
      },
    },
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
