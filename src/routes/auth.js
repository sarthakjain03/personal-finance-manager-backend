const express = require("express");
const authRouter = express.Router();

const User = require("../models/user");
const { validateLoginData } = require("../utils/validations");

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { email, name, expiresIn } = req.body;
    const { Authorization } = req.headers;
    const accessToken = Authorization.split(" ")[1];

    res.cookie("token", accessToken, {
      expires: new Date(Date.now() + expiresIn * 1000),
    });
    let userToken;

    const user = await User.findOne({ email });
    if (!user) {
      const newUser = new User({ name, email });
      await newUser.save();

      userToken = newUser.generateJWT(expiresIn);
    } else {
      userToken = user.generateJWT(expiresIn);
    }

    res.cookie("userToken", userToken, {
      expires: new Date(Date.now() + expiresIn * 1000),
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
    res.cookie("userToken", null, { expires: new Date(Date.now()) });
    res.cookie("token", null, { expires: new Date(Date.now()) });

    res.json({
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

module.exports = authRouter;
