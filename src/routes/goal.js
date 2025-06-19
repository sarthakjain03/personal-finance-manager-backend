const express = require("express");
const goalRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const {
  validatePageAndLimit,
  validateNewGoalData,
  validateEditGoalData,
} = require("../utils/validations");
const Goal = require("../models/goal");

goalRouter.get("/all", userAuth, async (req, res) => {
  try {
    validatePageAndLimit(req);

    const user = req.user;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 15;
    limit = limit > 15 ? 15 : limit;
    const offset = (page - 1) * limit;

    const userGoals = await Goal.find({ userId: user._id })
      .skip(offset)
      .limit(limit);

    res.json({
      success: true,
      message: "Goals fetched successfully",
      data: userGoals,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

goalRouter.post("/new", userAuth, async (req, res) => {
  try {
    validateNewGoalData(req);

    const user = req.user;
    const { title, description, category, targetAmount, deadline } = req.body;

    const newGoal = new Goal({
      userId: user._id,
      title,
      description,
      category,
      targetAmount,
      deadline,
    });

    await newGoal.save();

    res.json({
      success: true,
      message: "Goal added successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

goalRouter.patch("/edit/:id", userAuth, async (req, res) => {
  try {
    const goalId = req.params.id;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    validateEditGoalData(req, goal);

    const {
      title,
      description,
      category,
      currentAmount,
      targetAmount,
      deadline,
    } = req.body;

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (deadline !== undefined) goal.deadline = deadline;

    await goal.save();

    res.json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

goalRouter.delete("/delete/:id", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const goalId = req.params.id;

    const goal = await Goal.findOne({ _id: goalId, userId: user._id });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    await Goal.deleteOne({ _id: goalId, userId: user._id });

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

module.exports = goalRouter;
