import React from "react";

const AboutUs = () => (
  <div className="bg-[#101624] min-h-screen px-4 py-10 flex flex-col items-center">
    <div className="w-full max-w-6xl bg-gray-900 rounded-lg shadow-lg p-10">
      <h1 className="text-4xl font-bold text-blue-400 mb-4 text-center">About CineApp</h1>
      <p className="text-gray-300 text-lg mb-6 text-center">
        CineApp is your all-in-one platform for discovering, tracking, and sharing your love of movies. 
        We help you organize your watchlist, write reviews, and connect with fellow film enthusiasts—all in one beautiful, easy-to-use space.
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-300 mb-2">Our Mission</h2>
        <p className="text-gray-300 text-base">
          Our mission is to empower movie lovers to explore, track, and discuss the films they care about most.
          Whether you’re a casual viewer or a passionate cinephile, CineApp makes it simple and fun to manage your movie journey and share your opinions with the world.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-300 mb-2">What We Offer</h2>
        <ul className="list-disc list-inside text-gray-200 text-base space-y-1">
          <li>Personalized dashboard for saving, watching, and reviewing movies</li>
          <li>Powerful search and discovery powered by TMDB</li>
          <li>Easy-to-use interface and seamless experience on all devices</li>
          <li>Social features to share reviews and connect with friends</li>
          <li>Secure authentication and privacy-focused design</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-300 mb-2">Meet the Creator</h2>
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4">
          <img
            src="/images.jpg"
            alt="CineApp Founder"
            className="rounded-full w-32 h-32 object-cover border-4 border-blue-400"
          />
          <p className="text-gray-300 text-base mt-2 sm:mt-0">
            <strong>CineApp</strong> was created by <strong>Rohit Jaliminchi</strong>, a passionate developer dedicated to making movie discovery and sharing simple and enjoyable for everyone. I believe every film lover deserves an easy and beautiful way to explore, organize, and share their favorite movies, and CineApp is my way of bringing that vision to life.
          </p>
        </div>
      </section>

      <div className="text-center mt-8">
        <span className="text-blue-400 font-semibold">
          Thank you for choosing CineApp – Where Every Movie Matters!
        </span>
      </div>
    </div>
  </div>
);

export default AboutUs;
