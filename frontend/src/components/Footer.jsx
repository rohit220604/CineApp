import React from "react";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-200 py-8 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-8">
      {/* About Section */}
      <div>
        <h2 className="font-semibold text-lg mb-1">CineApp</h2>
        <p className="text-gray-400 max-w-xs">
          Your personal hub to discover, save, and review movies. Made for film lovers by a film lover.
        </p>
      </div>
      {/* Made By Section */}
      <div className="flex flex-col items-center md:items-center">
        <span className="text-gray-400">
          Made with <span className="text-red-500">♥</span> by <span className="font-semibold text-blue-300">Rohit Jaliminchi</span>
        </span>
      </div>
      {/* Contact & Socials */}
      <div className="flex flex-col items-end">
        <div className="flex space-x-4 mb-2">
          <a href="https://github.com/rohit220604" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg className="w-6 h-6 text-gray-400 hover:text-blue-400 transition" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.415-4.033-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.932 0-1.31.467-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.629-5.475 5.922.43.372.814 1.102.814 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <a href="https://x.com/RohitJaliminchi" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <svg className="w-6 h-6 text-gray-400 hover:text-blue-400 transition" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.384 4.482A13.936 13.936 0 0 1 1.671 3.149a4.917 4.917 0 0 0 1.523 6.573 4.897 4.897 0 0 1-2.229-.616c-.054 2.28 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084 4.928 4.928 0 0 0 4.6 3.419A9.867 9.867 0 0 1 0 21.543a13.905 13.905 0 0 0 7.548 2.212c9.058 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/>
            </svg>
          </a>
          <a href="https://linkedin.com/in/rohit-jaliminchi-98555224b" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg className="w-6 h-6 text-gray-400 hover:text-blue-400 transition" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.27c-.966 0-1.75-.79-1.75-1.76 0-.97.784-1.76 1.75-1.76s1.75.79 1.75 1.76c0 .97-.784 1.76-1.75 1.76zm13.5 10.27h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.74z"/>
            </svg>
          </a>
        </div>
        <div className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} CineApp. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
