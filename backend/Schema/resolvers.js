const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Review = require("../models/Review");
const { sendOtpMail } = require("../utils/mailer");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
    
    isUsernameAvailable: async (_,{username}) => {
      const normalized = username.trim().toLowerCase();
      const existingUser = await User.findOne({ username: normalized });
      return !existingUser;
    },

    searchUsers: async (_, { query }) => {
      if (!query.trim()) return [];
      return await User.find({
      username: { $regex: query, $options: "i" }
      }).limit(10).select("_id username");
    },

    userProfile: async (_, { username }, { dataSources }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");
      return {
        username: user.username,
        publicName: user.publicName,
        followers: user.followers,
        following: user.following,
        savedMovies: user.savedMovies,
        watchedMovies: user.watchedMovies,
      };
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

    unfollow: async (_, { username }, { user }) => {
      if (!user || !user.id) throw new Error("Not authenticated");
      if (!username) throw new Error("No username provided");
    
      // Query current user's document to get username
      const currentUser = await User.findById(user.id);
      if (!currentUser) throw new Error("Current user not found");
    
      const currentUsername = currentUser.username.trim().toLowerCase();
      const targetUsername = username.trim().toLowerCase();
    
      if (currentUsername === targetUsername) throw new Error("Cannot unfollow yourself");
    
      const targetUser = await User.findOne({ username: targetUsername });
      if (!targetUser) throw new Error("User not found");
    
      if (!currentUser.following.includes(targetUsername)) {
        throw new Error("You are not following this user");
      }
    
      // Remove targetUser from currentUser's following
      currentUser.following = currentUser.following.filter(u => u !== targetUsername);
      await currentUser.save();
    
      // Remove currentUser from targetUser's followers
      targetUser.followers = targetUser.followers.filter(u => u !== currentUsername);
      await targetUser.save();
    
      return true;
    },
    
    removeFollower: async (_, { username }, { user }) => {
      if (!user || !user.id) throw new Error("Not authenticated");
      if (!username) throw new Error("No username provided");
    
      // Query current user's document to get username
      const currentUser = await User.findById(user.id);
      if (!currentUser) throw new Error("Current user not found");
    
      const currentUsername = currentUser.username.trim().toLowerCase();
      const targetUsername = username.trim().toLowerCase();
    
      if (currentUsername === targetUsername) throw new Error("Cannot remove yourself");
    
      const targetUser = await User.findOne({ username: targetUsername });
      if (!targetUser) throw new Error("User not found");
    
      if (!currentUser.followers.includes(targetUsername)) {
        throw new Error("This user is not your follower");
      }
    
      // Remove targetUser from currentUser's followers
      currentUser.followers = currentUser.followers.filter(u => u !== targetUsername);
      await currentUser.save();
    
      // Remove currentUser from targetUser's following
      targetUser.following = targetUser.following.filter(u => u !== currentUsername);
      await targetUser.save();
    
      return true;
    },
    googleLogin: async (_, { token }) => {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      let user = await User.findOne({ email: payload.email });
      if (!user) {
        let baseUsername = (payload.name || payload.email.split('@')[0]).replace(/\W/g, '').toLowerCase();
        let username = baseUsername;
        let count = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${count++}`;
        }
        user = await User.create({
          username,
          email: payload.email,
          isVerified: true,
        });
      }
      const jwtToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
      return { token: jwtToken, user };
    },
  },

  Review: {
    user: async (parent, _, { User }) => {
      return await User.findById(parent.user);
    },
  },
};
