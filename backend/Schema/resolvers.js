const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Review = require("../models/Review");
const { sendOtpMail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await User.findById(user.id);
    },
    myReviews: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await Review.find({ user: user.id });
    },
    myWatchedMovies: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const me = await User.findById(user.id);
      return me.watchedMovies;
    },
    mySavedMovies: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");  
      const me = await User.findById(user.id);
      return me.savedMovies;
    },
    reviewsForMovie: async (_, { tmdbId }) => {
      return await Review.find({ tmdbId }).populate("user");
    },
  },

  Mutation: {
    register: async (_, { name, email, password }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already registered");
      const hashed = await bcrypt.hash(password, 10);
      const otp = await sendOtpMail(email);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await User.create({
        name,
        email,
        password: hashed,
        otp,
        otpExpires,
        isVerified: false,
        savedMovies: [],
        watchedMovies: [],
      });
      return true;
    },

    verifyOTP: async (_, { email, otp }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      if (user.isVerified) return true;
      if (user.otp !== otp || user.otpExpires < new Date()) throw new Error("Invalid or expired OTP");
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return true;
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !user.isVerified) throw new Error("Invalid credentials or not verified");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid credentials");
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      return { token, user };
    },

    forgotPassword: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      const otp = await sendOtpMail(email);
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      return true;
    },

    resetPassword: async (_, { email, otp, newPassword }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      if (user.otp !== otp || user.otpExpires < new Date()) throw new Error("Invalid or expired OTP");
      user.password = await bcrypt.hash(newPassword, 10);
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return true;
    },

    saveForLater: async (_, { tmdbId }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      await User.findByIdAndUpdate(user.id, { $addToSet: { savedMovies: tmdbId } });
      return true;
    },

    markAsWatched: async (_, { tmdbId }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      await User.findByIdAndUpdate(user.id, { $addToSet: { watchedMovies: tmdbId } });
      return true;
    },

    removeFromSaved: async (_, { tmdbId }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      await User.findByIdAndUpdate(user.id, { $pull: { savedMovies: tmdbId } });
      return true;
    },

    removeFromWatched: async (_, { tmdbId }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      await User.findByIdAndUpdate(user.id, { $pull: { watchedMovies: tmdbId } });
      return true;
    }, 

    addReview: async (_, { tmdbId, rating, comment }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const review = await Review.create({
        user: user.id,
        tmdbId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      });
      await review.populate("user");
      return review;
    },
  },

  Review: {
    user: async (parent, _, { User }) => {
      return await User.findById(parent.user);
    },
  },
};
