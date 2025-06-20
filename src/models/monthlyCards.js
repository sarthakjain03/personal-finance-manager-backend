const mongoose = require("mongoose");

const cardDataSchema = new mongoose.Schema({
  currentMonth: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lastMonth: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  percentChange: {
    type: Number,
    required: true,
    default: 0,
  },
});

const monthlyCardsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    incomeStats: cardDataSchema,
    spendingStats: cardDataSchema,
  },
  {
    timestamps: true,
  }
);

const MonthlyCards = mongoose.model("MonthlyCards", monthlyCardsSchema);

module.exports = MonthlyCards;
