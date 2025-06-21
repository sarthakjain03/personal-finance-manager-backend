const validator = require("validator");
const { TransactionTypes, Categories, Timelines } = require("./enums");

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
  if (!validator.isNumeric(amount)) {
    throw new Error("Amount must be a number");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  if (!Categories.includes(category)) {
    throw new Error("Invalid Category");
  }
  if (!TransactionTypes.includes(transactionType)) {
    throw new Error("Invalid Transaction Type");
  }
  if (transactionType === "Expense" && user.currentBalance < amount) {
    throw new Error("Insufficient Balance");
  }
  if (transactionType !== "Income" && transactionType !== "Expense") {
    throw new Error("Invalid Transaction Type");
  }
  if (!validator.isDate(date)) {
    throw new Error("Date must be a date");
  }
};

const validateEditTransactionData = (req, oldTransaction) => {
  const { description, category, transactionType, amount, date } = req.body;
  const user = req.user;
  if (!description && !category && !transactionType && !amount && !date) {
    throw new Error("Nothing to Update");
  }
  if (category !== undefined && !Categories.includes(category)) {
    throw new Error("Invalid Category");
  }
  if (
    transactionType !== undefined &&
    !TransactionTypes.includes(transactionType)
  ) {
    throw new Error("Invalid Transaction Type");
  }
  if (amount !== undefined) {
    if (!validator.isNumeric(amount)) {
      throw new Error("Amount must be a number");
    }
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
  if (date !== undefined && !validator.isDate(date)) {
    throw new Error("Date must be a date");
  }
};

const validatePageAndLimit = (req) => {
  if (!req.query.page || !req.query.limit) {
    throw new Error("Page and Limit are required as queries");
  }
  if (isNaN(parseInt(req.query.page)) || isNaN(parseInt(req.query.limit))) {
    throw new Error("Page and Limit must be numbers");
  }
  if (parseInt(req.query.page) <= 0 || parseInt(req.query.limit) <= 0) {
    throw new Error("Page and Limit must be greater than 0");
  }
};

const validateNewGoalData = (req) => {
  const { title, description, category, targetAmount, deadline } = req.body;
  if (!title || !description || !category || !targetAmount || !deadline) {
    throw new Error("All fields are required");
  }
  if (title.length < 3 || title.length > 50) {
    throw new Error("Title must be between 3 and 50 characters");
  }
  if (description.length > 250) {
    throw new Error("Description must be less than 250 characters");
  }
  if (category.length < 2 || category.length > 30) {
    throw new Error("Category must be between 2 and 30 characters");
  }
  if (!validator.isNumeric(targetAmount)) {
    throw new Error("Target Amount must be a number");
  }
  if (targetAmount <= 0) {
    throw new Error("Target Amount must be greater than 0");
  }
  if (!validator.isDate(deadline)) {
    throw new Error("Deadline must be a date");
  }
  if (deadline <= new Date()) {
    throw new Error("Deadline must be greater than current date");
  }
};

const validateEditGoalData = (req, oldGoal) => {
  const {
    title,
    description,
    category,
    currentAmount,
    targetAmount,
    deadline,
  } = req.body;

  if (
    !title &&
    !description &&
    !category &&
    !currentAmount &&
    !targetAmount &&
    !deadline
  ) {
    throw new Error("Nothing to Update");
  }
  if ((title !== undefined && title.length < 3) || title.length > 50) {
    throw new Error("Title must be between 3 and 50 characters");
  }
  if (description !== undefined && description.length > 250) {
    throw new Error("Description must be less than 250 characters");
  }
  if (category !== undefined && (category.length < 2 || category.length > 30)) {
    throw new Error("Category must be between 2 and 30 characters");
  }
  if (currentAmount !== undefined) {
    if (!validator.isNumeric(currentAmount))
      throw new Error("Current Amount must be a number");
    if (currentAmount <= 0)
      throw new Error("Current Amount must be greater than 0");
    if (
      (targetAmount !== undefined && currentAmount > targetAmount) ||
      currentAmount > oldGoal.targetAmount
    )
      throw new Error("Current Amount must be less than Target Amount");
  }
  if (targetAmount !== undefined) {
    if (!validator.isNumeric(targetAmount))
      throw new Error("Target Amount must be a number");
    if (targetAmount <= 0)
      throw new Error("Target Amount must be greater than 0");
    if (
      (currentAmount !== undefined && targetAmount < currentAmount) ||
      targetAmount < oldGoal.currentAmount
    )
      throw new Error(
        "Target Amount must be more than or equal to Current Amount"
      );
  }
  if (deadline !== undefined) {
    if (!validator.isDate(deadline)) throw new Error("Deadline must be a date");
    if (deadline <= new Date())
      throw new Error("Deadline must be greater than current date");
  }
};

const validateNewBudgetData = (req) => {
  const { category, budgetAmount } = req.body;
  if (!category || !budgetAmount) {
    throw new Error("All fields are required");
  }
  if (!Categories.includes(category)) {
    throw new Error("Invalid Category");
  }
  if (!validator.isNumeric(budgetAmount)) {
    throw new Error("Budget Amount must be a number");
  }
  if (budgetAmount <= 0) {
    throw new Error("Budget Amount must be greater than 0");
  }
};

const validateEditBudgetData = (req, oldBudget) => {
  const { category, budgetAmount } = req.body;
  if (!category && !budgetAmount) {
    throw new Error("Nothing to Update");
  }
  if (category !== undefined && !Categories.includes(category)) {
    throw new Error("Invalid Category");
  }
  if (budgetAmount !== undefined) {
    if (!validator.isNumeric(budgetAmount)) {
      throw new Error("Budget Amount must be a number");
    }
    if (budgetAmount <= 0) {
      throw new Error("Budget Amount must be greater than 0");
    }
    if (
      budgetAmount < oldBudget.budgetAmount &&
      budgetAmount > oldBudget.remainingAmount
    )
      throw new Error("Budget Amount must be less than Remaining Amount");
  }
};

const validateTrendData = (req) => {
  const { type } = req.params;
  const { timeline } = req.query;
  if (!type || !timeline) {
    throw new Error(
      "Type is required as param and timeline is required as query"
    );
  }

  const transactionType = type[0].toUpperCase() + type.slice(1);
  if (!TransactionTypes.includes(transactionType)) {
    throw new Error("Invalid transaction type");
  }

  if (!Timelines.includes(timeline)) {
    throw new Error("Invalid timeline");
  }
};

module.exports = {
  validateLoginData,
  validateNewTransactionData,
  validateEditTransactionData,
  validatePageAndLimit,
  validateNewGoalData,
  validateEditGoalData,
  validateNewBudgetData,
  validateEditBudgetData,
  validateTrendData,
};
