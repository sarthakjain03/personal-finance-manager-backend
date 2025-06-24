const mongoose = require("mongoose");
const { Categories } = require("../utils/constants");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: Categories,
      required: true,
    },
    spentAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    budgetAmount: {
      type: Number,
      required: true,
      min: 100,
      max: 1000000,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    spentPercentage: {
      type: Number,
      required: true,
      default: 0,
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

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
