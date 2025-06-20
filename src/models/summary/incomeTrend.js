const mongoose = require("mongoose");

const incomeTrendSchema = new mongoose.Schema({});

const IncomeTrend = mongoose.model("IncomeTrend", incomeTrendSchema);

module.exports = IncomeTrend;
