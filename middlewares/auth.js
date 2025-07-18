const jwt = require("jsonwebtoken");
const User = require("../../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token, userToken } = req.cookies;
    if (!token || !userToken) {
      res.status(401).send({
        status: false,
        message: "Unauthorized",
      });
      return;
    }

    const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    const { _id } = decodedToken;

    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send({
        status: false,
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    throw error;
  }
};

module.exports = { userAuth };
