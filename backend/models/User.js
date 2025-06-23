const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/ 
  },
  publicName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otp: String,
  otpExpires: Date,
  watchedMovies: [Number],
  savedMovies: [Number],
  followers: [{ type: String }],         
  following: [{ type: String }],         
  followRequests: [{ type: String }],   
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
