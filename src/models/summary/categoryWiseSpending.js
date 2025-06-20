const mongoose = require("mongoose");

const categoryWiseSpendingSchema = new mongoose.Schema({});

const CategoryWiseSpending = mongoose.model(
  "CategoryWiseSpending",
  categoryWiseSpendingSchema
);

module.exports = CategoryWiseSpending;
