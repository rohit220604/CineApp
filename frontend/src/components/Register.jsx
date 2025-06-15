import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
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
            mutation Register($name: String!, $email: String!, $password: String!) {
              register(name: $name, email: $email, password: $password)
            }
          `,
          variables: {
            name: form.name,
            email: form.email,
            password: form.password,
          },
        }),
      });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        setError(errors[0].message);
      } else if (data && data.register) {
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

  const handleVerifyOtp = async (e) => {
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
            mutation VerifyOTP($email: String!, $otp: String!) {
              verifyOTP(email: $email, otp: $otp)
            }
          `,
          variables: {
            email: form.email,
            otp: form.otp,
          },
        }),
      });
      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        setError(errors[0].message);
      } else if (data && data.verifyOTP) {
        setInfo("Registration successful! Redirecting to login...");
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
        <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Register for CineApp</h2>
        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-5">
            {error && <div className="text-red-400 text-center">{error}</div>}
            {info && <div className="text-green-400 text-center">{info}</div>}
            {loading && <div className="text-blue-400 text-center">Registering...</div>}
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
              />
            </div>
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
            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
              disabled={loading}
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {error && <div className="text-red-400 text-center">{error}</div>}
            {info && <div className="text-green-400 text-center">{info}</div>}
            {loading && <div className="text-blue-400 text-center">Verifying OTP...</div>}
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
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
              disabled={loading}
            >
              Verify OTP
            </button>
          </form>
        )}
        <div className="text-center mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
