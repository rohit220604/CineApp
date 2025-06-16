const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  watchedMovies: [Number],
  savedMovies: [Number]
});

module.exports = mongoose.model("User", userSchema);
