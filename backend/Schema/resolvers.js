const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpMail } = require("../utils/mailer"); // Removed generateOtp import

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await User.findById(user.id);
    },
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already registered");
      const hashed = await bcrypt.hash(password, 10);
      const otp = await sendOtpMail(email); // OTP generated and sent here
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await User.create({ 
        name, 
        email, 
        password: hashed, 
        otp, 
        otpExpires, 
        isVerified: false 
      });
      return "OTP sent to email";
    },
    verifyOTP: async (_, { email, otp }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      if (user.isVerified) return "Already verified";
      if (user.otp !== otp || user.otpExpires < new Date()) throw new Error("Invalid or expired OTP");
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return "Email verified. You can now log in.";
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
      const otp = await sendOtpMail(email); // OTP generated and sent here
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      return "OTP sent to email";
    },
    resetPassword: async (_, { email, otp, newPassword }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");
      if (user.otp !== otp || user.otpExpires < new Date()) throw new Error("Invalid or expired OTP");
      user.password = await bcrypt.hash(newPassword, 10);
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return "Password reset successful";
    },
  },
};
