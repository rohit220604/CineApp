import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // Adjust the path if needed

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user {
                  id
                  username
                  email
                  isVerified
                }
              }
            }
          `,
          variables: { email, password },
        }),
      });

      const { data, errors } = await response.json();
      console.log("Login response:", { data, errors });
      
      if (errors && errors.length > 0) {
        setError(errors[0].message);
      } else if (data && data.login) {
        // Update AuthContext and localStorage
        login(data.login.token, data.login.user);
        navigate("/");
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
        <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">Sign in to CineApp</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-red-400 text-center">{error}</div>}
          {loading && <div className="text-blue-400 text-center">Signing in...</div>}
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition"
            disabled={loading}
          >
            Sign In
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm text-gray-400">
          <span>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
          </span>
          <Link to="/forgot-password" className="text-blue-400 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
