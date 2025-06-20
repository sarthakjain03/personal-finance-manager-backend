const mongoose = require("mongoose");

const spendingTrendSchema = new mongoose.Schema({});

const SpendingTrend = mongoose.model("SpendingTrend", spendingTrendSchema);

module.exports = SpendingTrend;
