const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
  },
  description: {
    type: String,
    trim: true,
    maxLength: 250,
  },
  currentAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 100,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 30,
  },
  deadline: {
    type: Date,
    required: true,
  },
});

const Goal = mongoose.model("Goal", goalSchema);

module.exports = Goal;
