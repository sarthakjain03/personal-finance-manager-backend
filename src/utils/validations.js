const validator = require("validator");
const { TransactionTypes, Categories, Timelines } = require("./constants");

const validateLoginData = (req) => {
  const { email, name, expiresIn, profilePhotoUrl } = req.body;
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("Authorization header is required");
  }
  const accessToken = authorization.includes("Bearer")
    ? authorization.split(" ")[1]
    : null;
  if (!accessToken) {
    throw new Error("Access Token is required");
  }
  if (!email || !name || !accessToken || !expiresIn || !profilePhotoUrl) {
    throw new Error("All fields are required");
  }
  if (!validator.isURL(profilePhotoUrl)) {
    throw new Error("Invalid profile photo url");
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
  if (description.length > 50) {
    throw new Error("Description must be less than 50 characters");
  }
  if (isNaN(amount)) {
    throw new Error("Amount must be a number");
  }
  if (amount <= 0 || amount > 1000000) {
    throw new Error("Amount must be greater than 0 and less than 1000000");
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
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error("Date must be a valid date");
  }
};

const validateEditTransactionData = (req, oldTransaction) => {
  const { description, category, transactionType, amount, date } = req.body;
  const user = req.user;
  if (!description && !category && !transactionType && !amount && !date) {
    throw new Error("Nothing to Update");
  }
  if (description !== undefined && description.length > 50) {
    throw new Error("Description must be less than 50 characters");
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
    if (amount <= 0 || amount > 1000000) {
      throw new Error("Amount must be greater than 0 and less than 1000000");
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
  if (date !== undefined) {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error("Date must be a valid date");
    }
  }
};

const validateGetTransactionsData = (req) => {
  if (!req.body.page || !req.body.limit) {
    throw new Error("Page and Limit are required");
  }
  if (isNaN(parseInt(req.body.page)) || isNaN(parseInt(req.body.limit))) {
    throw new Error("Page and Limit must be numbers");
  }
  if (parseInt(req.body.page) <= 0 || parseInt(req.body.limit) <= 0) {
    throw new Error("Page and Limit must be greater than 0");
  }
  if (req.body.category && !Categories.includes(req.body.category)) {
    throw new Error("Invalid Category");
  }
  if (req.body.type && !TransactionTypes.includes(req.body.type)) {
    throw new Error("Invalid Transaction Type");
  }
};

const validateNewGoalData = (req) => {
  const {
    title,
    description,
    category,
    targetAmount,
    deadline,
    currentAmount,
  } = req.body;
  if (
    !title ||
    !description ||
    !category ||
    !targetAmount ||
    !deadline ||
    !currentAmount
  ) {
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
  if (isNaN(targetAmount)) {
    throw new Error("Target Amount must be a number");
  }
  if (targetAmount <= 100) {
    throw new Error("Target Amount must be greater than 100");
  }
  if (isNaN(currentAmount)) throw new Error("Current Amount must be a number");
  if (currentAmount <= 0)
    throw new Error("Current Amount must be greater than 0");
  if (currentAmount > targetAmount)
    throw new Error("Current Amount must be less than Target Amount");

  const parsed = new Date(deadline);
  if (isNaN(parsed.getTime())) {
    throw new Error("Deadline must be a valid date");
  }

  if (parsed <= new Date()) {
    throw new Error("Deadline must be greater than the current date");
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
    if (isNaN(currentAmount))
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
    if (isNaN(targetAmount)) throw new Error("Target Amount must be a number");
    if (targetAmount <= 100)
      throw new Error("Target Amount must be greater than 100");
    if (
      (currentAmount !== undefined && targetAmount < currentAmount) ||
      targetAmount < oldGoal.currentAmount
    )
      throw new Error(
        "Target Amount must be more than or equal to Current Amount"
      );
  }
  if (deadline !== undefined) {
    const parsed = new Date(deadline);

    if (isNaN(parsed.getTime())) {
      throw new Error("Deadline must be a valid date");
    }

    if (parsed <= new Date()) {
      throw new Error("Deadline must be greater than the current date");
    }
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
  if (isNaN(budgetAmount)) {
    throw new Error("Budget Amount must be a number");
  }
  if (budgetAmount <= 100) {
    throw new Error("Budget Amount must be greater than 100");
  }
  if (budgetAmount > 1000000) {
    throw new Error("Budget Amount must be less than 1000000");
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
    if (isNaN(budgetAmount)) {
      throw new Error("Budget Amount must be a number");
    }
    if (budgetAmount <= 100) {
      throw new Error("Budget Amount must be greater than 100");
    }
    if (budgetAmount > 1000000) {
      throw new Error("Budget Amount must be less than 1000000");
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

const validateCategoryWiseExpensesData = (req) => {
  const { timeline } = req.query;
  if (!timeline) {
    throw new Error("Timeline is required as query");
  }
  if (!Timelines.includes(timeline)) {
    throw new Error("Invalid timeline");
  }
};

module.exports = {
  validateLoginData,
  validateNewTransactionData,
  validateEditTransactionData,
  validateGetTransactionsData,
  validateNewGoalData,
  validateEditGoalData,
  validateNewBudgetData,
  validateEditBudgetData,
  validateTrendData,
  validateCategoryWiseExpensesData,
};
