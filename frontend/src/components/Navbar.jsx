import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // adjust path as needed

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-[#151c27] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      {/* Left: Logo and Home */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <svg
            className="w-7 h-7 text-blue-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5V7H3V4.5ZM3 8.5V19.5A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5V8.5H3Zm5.25-4.5 1.5 3h2.5l-1.5-3h-2.5Zm4 0 1.5 3h2.5l-1.5-3h-2.5Z" />
          </svg>
          <span className="text-2xl font-bold text-blue-400">CineApp</span>
        </Link>
        <div className="ml-8">
          <Link
            to="/"
            className="flex items-center text-base font-medium text-gray-200 hover:text-blue-400 transition px-3 py-1 rounded hover:bg-[#1e2636]"
          >
            <svg
              className="w-5 h-5 mr-1 text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4h2v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-7-7z" />
            </svg>
            Home
          </Link>
        </div>
        <div className="ml-8">
          <Link
            to="/about"
            className="flex items-center text-base font-medium text-gray-200 hover:text-blue-400 transition px-3 py-1 rounded hover:bg-[#1e2636]"
          >
            <svg
              className="w-5 h-5 mr-1 text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            About Us
          </Link>
        </div>
      </div>

      {/* Right: Login or User Dropdown */}
      <div className="relative">
        {!user ? (
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded transition"
          >
            Login
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg focus:outline-none"
              aria-label="User menu"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white rounded shadow-lg z-50"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
