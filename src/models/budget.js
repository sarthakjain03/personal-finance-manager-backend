const mongoose = require("mongoose");
const { CategoryEnums } = require("../utils/enums");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: CategoryEnums,
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
  { timestamps: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
