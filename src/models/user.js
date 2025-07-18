const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      default:
        "https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg",
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currencyFormat: {
      type: String,
      default: "INR",
      enum: [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CNY",
        "CAD",
        "AUD",
        "CHF",
        "INR",
        "KRW",
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.updatedAt;
      },
    },
  }
);

userSchema.methods.generateJWT = function (expiresIn) {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
