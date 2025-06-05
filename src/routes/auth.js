const express = require("express");
const authRouter = express.Router();

const User = require("../models/user");
const bcrypt = require("bcrypt");
const {
  validateLoginData,
  validateSignUpData,
} = require("../utils/validations");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.send({
      success: true,
      message: "User created successfully!",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "" + error?.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordCorrect = await user?.validatePassword(password);
    if (!isPasswordCorrect) {
      res.status(400).send({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = user.generateJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.send({
      success: true,
      message: "User Logged In Successfully",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "" + error?.message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { expires: new Date(Date.now()) }).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.send(400).json({
      success: false,
      message: "" + error?.message,
    });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email",
            })
        }

        const token = user.generateResetPasswordToken();
        const resetPasswordUrl = ""

        // TODO: add the function to send the resetPasswordUrl to the user's email
        await user.save();

        res.json({
            success: true,
            message: "Password reset link sent to your email",
        })
        
    } catch (error) {
        res.send(400).json({
            success: false,
            message: "" + error?.message,
        })
    }
});

// TODO: handle the reset password functionality

module.exports = authRouter;
