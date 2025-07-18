const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../src/middlewares/auth");
const User = require("../models/user");
const { validateNewCurrencyFormat } = require("../utils/validations");

userRouter.post("/update-currency-format", userAuth, async (req, res) => {
  try {
    validateNewCurrencyFormat(req);
    const user = req.user;
    const { newCurrencyFormat } = req.body;

    user.currencyFormat = newCurrencyFormat;
    await user.save();

    res.json({
      success: true,
      message: "Currency format updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "" + error.message,
    });
  }
});

module.exports = userRouter;
