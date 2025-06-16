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

const validateNewTransactionData = (req) => {
  const { description, category, transactionType, amount, date } = req.body;
  const user = req.user;
  if (!description || !category || !transactionType || !amount || !date) {
    throw new Error("All fields are required");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  if (transactionType === "Expense" && user.currentBalance < amount) {
    throw new Error("Insufficient Balance");
  }
  if (transactionType !== "Income" && transactionType !== "Expense") {
    throw new Error("Invalid Transaction Type");
  }
};

const validateEditTransactionData = (req, oldTransaction) => {
  const { description, category, transactionType, amount, date } = req.body;
  const user = req.user;
  if (!description && !category && !transactionType && !amount && !date) {
    throw new Error("Nothing to Update");
  }
  if (amount !== undefined) {
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (
      (transactionType === "Expense" ||
        (transactionType === undefined &&
          oldTransaction.transactionType === "Expense")) &&
      user.currentBalance < amount
    ) {
      throw new Error("Insufficient Balance");
    }
  }
  if (
    transactionType !== undefined &&
    transactionType !== "Income" &&
    transactionType !== "Expense"
  ) {
    throw new Error("Invalid Transaction Type");
  }
};

module.exports = { validateLoginData, validateNewTransactionData };
