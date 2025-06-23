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

    followers: async (_, { username }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");
      return user.followers;
    },

    following: async (_, { username }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");
      return user.following;
    },

    pendingFollowRequests: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const me = await User.findById(user.id);
      return me.followRequests;
    },
    userWatchedMovies: async (_, { username }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const target = await User.findOne({ username });
      if (!target) throw new Error("User not found");
    
      // Only allow if the current user is in the target's followers
      if (!target.followers.includes(user.username)) {
        throw new Error("You must be an approved follower to view these movies.");
      }
      return target.watchedMovies;
    },
    
    userSavedMovies: async (_, { username }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const target = await User.findOne({ username });
      if (!target) throw new Error("User not found");
    
      // Only allow if the current user is in the target's followers
      if (!target.followers.includes(user.username)) {
        throw new Error("You must be an approved follower to view these movies.");
      }
      return target.savedMovies;
    },    
  },

  Mutation: {
    register: async (_, { publicName, email, password, username }) => {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error("Email already registered");

      const existingUsername = await User.findOne({ username });
      if (existingUsername) throw new Error("Username already taken");

      const hashed = await bcrypt.hash(password, 10);
      const otp = await sendOtpMail(email);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await User.create({
        email,
        password: hashed,
        username,
        publicName,
        otp,
        otpExpires,
        isVerified: false,
        savedMovies: [],
        watchedMovies: [],
        followers: [],
        following: [],
        followRequests: [],
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

    sendFollowRequest: async (_, { username }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const me = await User.findById(user.id);
      if (me.username === username) throw new Error("Cannot follow yourself.");

      const target = await User.findOne({ username });
      if (!target) throw new Error("User not found.");

      if (
        target.followRequests.includes(me.username) ||
        target.followers.includes(me.username)
      )
        return false;

      target.followRequests.push(me.username);
      await target.save();
      return true;
    },

    acceptFollowRequest: async (_, { username }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const me = await User.findById(user.id);

      const idx = me.followRequests.indexOf(username);
      if (idx === -1) throw new Error("No such follow request.");

      me.followRequests.splice(idx, 1);
      me.followers.push(username);

      const requester = await User.findOne({ username });
      requester.following.push(me.username);

      await me.save();
      await requester.save();
      return true;
    },

    rejectFollowRequest: async (_, { username }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const me = await User.findById(user.id);

      const idx = me.followRequests.indexOf(username);
      if (idx === -1) throw new Error("No such follow request.");

      me.followRequests.splice(idx, 1);
      await me.save();
      return true;
    },
  },

  Review: {
    user: async (parent, _, { User }) => {
      return await User.findById(parent.user);
    },
  },
};
