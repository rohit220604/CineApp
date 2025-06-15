const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate cryptographically secure 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString(); // 100000-999999 inclusive
};

exports.sendOtpMail = async (to) => {
  const otp = generateOtp();
  await transporter.sendMail({
    from: `"CineApp" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your CineApp OTP Code",
    html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
  });
  return otp; // Return generated OTP for database storage
};
