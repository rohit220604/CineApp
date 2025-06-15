import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation ForgotPassword($email: String!) {
              forgotPassword(email: $email)
            }
          `,
          variables: { email: form.email },
        }),
      });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        setError(errors[0].message);
      } else if (data && data.forgotPassword) {
        setInfo("OTP sent to your email.");
        setStep(2);
      } else {
        setError("Unexpected error. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation ResetPassword($email: String!, $otp: String!, $newPassword: String!) {
              resetPassword(email: $email, otp: $otp, newPassword: $newPassword)
            }
          `,
          variables: {
            email: form.email,
            otp: form.otp,
            newPassword: form.newPassword,
          },
        }),
      });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        setError(errors[0].message);
      } else if (data && data.resetPassword) {
        setInfo("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError("Unexpected error. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101624] px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Reset Password</h2>
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {error && <div className="text-red-400 text-center">{error}</div>}
            {info && <div className="text-green-400 text-center">{info}</div>}
            {loading && <div className="text-blue-400 text-center">Sending OTP...</div>}
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
              disabled={loading}
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {error && <div className="text-red-400 text-center">{error}</div>}
            {info && <div className="text-green-400 text-center">{info}</div>}
            {loading && <div className="text-blue-400 text-center">Resetting password...</div>}
            <div>
              <label className="block text-gray-300 mb-1">Enter OTP sent to {form.email}</label>
              <input
                name="otp"
                type="text"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="New Password"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Confirm New Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
              disabled={loading}
            >
              Reset Password
            </button>
          </form>
        )}
        <div className="text-center mt-4 text-sm text-gray-400">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
