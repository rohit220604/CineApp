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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Trigger Google OAuth flow
  const handleGoogleLogin = () => {
    window.open(`${backendUrl}/auth/google`, "_self");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${backendUrl}/graphql`, {
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
      if (errors && errors.length > 0) {
        setError(errors[0].message);
      } else if (data && data.login) {
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
        <div className="flex flex-col gap-2 mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 bg-white text-gray-900 font-semibold rounded flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 transition"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" className="inline-block" aria-hidden="true">
              <g>
                <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7.5-10.3 7.5-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l6.5-6.5C35.1 6.5 29.8 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.5-.3-3.5z"/>
                <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.6 0 5 .9 6.9 2.4l6.5-6.5C35.1 6.5 29.8 4 24 4c-7.2 0-13.4 3.1-17.7 8.1z"/>
                <path fill="#FBBC05" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.2-5.1c-1.8 1.2-4.1 2-7.3 2-4.6 0-8.7-3.2-10.3-7.5l-6.6 5.1C10.6 40.9 16.8 44 24 44z"/>
                <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.7 5.2-7.3 5.2-4.6 0-8.7-3.2-10.3-7.5l-6.6 5.1C10.6 40.9 16.8 44 24 44c7.2 0 13.4-3.1 17.7-8.1z"/>
              </g>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
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
