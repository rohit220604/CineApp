import React from "react";

const Navbar = () => (
  <nav className="bg-[#151c27] border-b border-gray-800 px-6 py-4 flex items-center">
    <a href="/" className="flex items-center space-x-2">
      <svg
        className="w-7 h-7 text-blue-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5V7H3V4.5ZM3 8.5V19.5A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5V8.5H3Zm5.25-4.5 1.5 3h2.5l-1.5-3h-2.5Zm4 0 1.5 3h2.5l-1.5-3h-2.5Z" />
      </svg>
      <span className="text-2xl font-bold text-blue-400">CineApp</span>
    </a>
    <div className="ml-8">
      <a
        href="/"
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
      </a>
    </div>
  </nav>
);

export default Navbar;
