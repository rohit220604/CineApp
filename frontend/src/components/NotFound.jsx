import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-4xl font-bold mb-4 text-[#8bb4ff]">404 - Page Not Found</h1>
    <p className="mb-6 text-lg text-gray-300">
      Sorry, the page you are looking for does not exist.
    </p>
    <Link
      to="/"
      className="px-6 py-2 bg-[#8bb4ff] text-[#181d2a] rounded font-semibold hover:bg-[#6a9be7] transition"
    >
      Go to Home
    </Link>
  </div>
);

export default NotFound;
