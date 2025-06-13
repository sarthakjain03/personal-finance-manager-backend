const validator = require("validator");

const validateLoginData = (req) => {
  const { email, name, accessToken, expiresIn } = req.body;
  if (!email || !name || !accessToken || !expiresIn) {
    throw new Error("All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (name.length < 2 || name.length > 50) {
    throw new Error("Name must be between 2 and 50 characters");
  }
};

module.exports = { validateLoginData };
