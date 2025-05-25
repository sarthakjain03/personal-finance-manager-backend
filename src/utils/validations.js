const validator = require("validator");

const validateLoginData = (req) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new Error("All fields are required");
    }
    if (!validator.isEmail(email)) {
        throw new Error("Invalid email format");
    }
}

const validateSignUpData = (req) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  if (name.length < 3 || name.length > 50) {
    throw new Error("Name must be between 3 and 50 characters");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }
};

module.exports = { validateSignUpData, validateLoginData };
