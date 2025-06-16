import React from "react";

// Dummy user data
const profile = {
  username: "MovieBuff123",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  watchlist: [
    { id: 1, title: "Inception", year: 2010, poster: "https://image.tmdb.org/t/p/w200/8s4h9friP6Ci3adRGahHARVd76E.jpg" },
    { id: 2, title: "Interstellar", year: 2014, poster: "https://image.tmdb.org/t/p/w200/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg" }
  ],
  watched: [
    { id: 3, title: "The Matrix", year: 1999, poster: "https://image.tmdb.org/t/p/w200/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { id: 4, title: "The Godfather", year: 1972, poster: "https://image.tmdb.org/t/p/w200/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" }
  ],
  reviews: [
    { id: 3, title: "The Matrix", year: 1999, poster: "https://image.tmdb.org/t/p/w200/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", review: "Amazing sci-fi classic!" },
    { id: 5, title: "Parasite", year: 2019, poster: "https://image.tmdb.org/t/p/w200/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", review: "Masterpiece!" }
  ]
};

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-blue-400 mb-4">{title}</h2>
    {children}
  </div>
);

const MovieCard = ({ movie, extra }) => (
  <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col w-44">
    <img
      src={movie.poster}
      alt={movie.title}
      className="h-60 object-cover w-full"
    />
    <div className="p-3 flex flex-col flex-1">
      <h3 className="text-base font-semibold text-white mb-1">{movie.title}</h3>
      <p className="text-xs text-gray-400 mb-2">{movie.year}</p>
      {extra}
    </div>
  </div>
);

const Profile = () => (
  <div className="bg-[#101624] min-h-screen px-4 py-8">
    {/* Profile Header */}
    <div className="flex items-center mb-10">
      <img
        src={profile.avatar}
        alt={profile.username}
        className="w-16 h-16 rounded-full border-4 border-blue-400 mr-4"
      />
      <div>
        <h1 className="text-3xl font-bold text-blue-400">{profile.username}</h1>
        <div className="text-gray-400 mt-1 text-sm">
          Watchlist: {profile.watchlist.length} &nbsp;|&nbsp; Watched: {profile.watched.length} &nbsp;|&nbsp; Reviews: {profile.reviews.length}
        </div>
      </div>
    </div>

    {/* Watchlist */}
    <Section title="Watchlist">
      <div className="flex flex-wrap gap-6">
        {profile.watchlist.length === 0 ? (
          <div className="text-gray-400">No movies in your watchlist.</div>
        ) : (
          profile.watchlist.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </Section>

    {/* Watched Movies */}
    <Section title="Watched Movies">
      <div className="flex flex-wrap gap-6">
        {profile.watched.length === 0 ? (
          <div className="text-gray-400">No watched movies yet.</div>
        ) : (
          profile.watched.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </Section>

    {/* Reviews */}
    <Section title="Your Reviews">
      <div className="flex flex-wrap gap-6">
        {profile.reviews.length === 0 ? (
          <div className="text-gray-400">No reviews yet.</div>
        ) : (
          profile.reviews.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              extra={
                <div className="mt-2 text-sm text-yellow-400 font-medium">
                  {movie.review}
                </div>
              }
            />
          ))
        )}
      </div>
    </Section>
  </div>
);

export default Profile;
