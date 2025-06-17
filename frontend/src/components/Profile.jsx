import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-blue-400 mb-4">{title}</h2>
    {children}
  </div>
);

const MovieItem = ({ movie, extra, removeHandler }) => (
  <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col w-44">
    <img
      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Image"}
      alt={movie.title}
      className="h-60 object-cover w-full"
    />
    <div className="p-3 flex flex-col flex-1">
      <h3 className="text-base font-semibold text-white mb-1">{movie.title}</h3>
      <p className="text-xs text-gray-400 mb-2">{movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}</p>
      {extra}
      {removeHandler && (
        <button
          onClick={removeHandler}
          className="mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
        >
          Remove
        </button>
      )}
    </div>
  </div>
);

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [savedMovies, setSavedMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [reviewMovies, setReviewMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              query {
                me {
                  name
                  savedMovies
                  watchedMovies
                }
                myReviews {
                  tmdbId
                  rating
                  comment
                  createdAt
                }
              }
            `,
          }),
        });
        const { data, errors } = await response.json();
        if (errors?.length) {
          setError(errors[0].message);
        } else if (data) {
          setProfile({
            ...data.me,
            reviews: data.myReviews
          });
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch movie details from TMDB for saved, watched, and reviewed movies
  useEffect(() => {
    const fetchMoviesByIds = async (ids, setter) => {
      if (!ids || ids.length === 0) {
        setter([]);
        return;
      }
      try {
        const movies = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`
            );
            if (!res.ok) return null;
            return await res.json();
          })
        );
        setter(movies.filter(Boolean));
      } catch {
        setter([]);
      }
    };

    if (profile) {
      fetchMoviesByIds(profile.savedMovies, setSavedMovies);
      fetchMoviesByIds(profile.watchedMovies, setWatchedMovies);

      // For reviews, fetch movie details for each tmdbId in reviews
      if (profile.reviews && profile.reviews.length > 0) {
        const reviewIds = profile.reviews.map(r => r.tmdbId);
        fetchMoviesByIds(reviewIds, setReviewMovies);
      } else {
        setReviewMovies([]);
      }
    }
  }, [profile]);

  // Remove from Saved
  const removeFromSaved = async (tmdbId) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation($tmdbId: Int!) {
            removeFromSaved(tmdbId: $tmdbId)
          }
        `,
        variables: { tmdbId },
      }),
    });
    setProfile(prev => ({
      ...prev,
      savedMovies: prev.savedMovies.filter(id => id !== tmdbId),
    }));
  };

  // Remove from Watched
  const removeFromWatched = async (tmdbId) => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation($tmdbId: Int!) {
            removeFromWatched(tmdbId: $tmdbId)
          }
        `,
        variables: { tmdbId },
      }),
    });
    setProfile(prev => ({
      ...prev,
      watchedMovies: prev.watchedMovies.filter(id => id !== tmdbId),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101624]">
        <div className="text-blue-400 text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101624]">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="bg-[#101624] min-h-screen px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center mb-10">
        <div className="w-16 h-16 rounded-full border-4 border-blue-400 mr-4 bg-gray-800 flex items-center justify-center">
          <span className="text-white text-xl">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-400">{profile.name}</h1>
          <div className="text-gray-400 mt-1 text-sm">
            Saved: {profile.savedMovies?.length || 0} &nbsp;|&nbsp; 
            Watched: {profile.watchedMovies?.length || 0} &nbsp;|&nbsp; 
            Reviews: {profile.reviews?.length || 0}
          </div>
        </div>
      </div>

      {/* Saved Movies */}
      <Section title="Saved Movies">
        <div className="flex flex-wrap gap-6">
          {profile.savedMovies?.length === 0 ? (
            <div className="text-gray-400">No saved movies.</div>
          ) : savedMovies.length === 0 ? (
            <div className="text-gray-400">Loading saved movies...</div>
          ) : (
            savedMovies.map(movie => (
              <MovieItem
                key={movie.id}
                movie={movie}
                removeHandler={() => removeFromSaved(movie.id)}
              />
            ))
          )}
        </div>
      </Section>

      {/* Watched Movies */}
      <Section title="Watched Movies">
        <div className="flex flex-wrap gap-6">
          {profile.watchedMovies?.length === 0 ? (
            <div className="text-gray-400">No watched movies.</div>
          ) : watchedMovies.length === 0 ? (
            <div className="text-gray-400">Loading watched movies...</div>
          ) : (
            watchedMovies.map(movie => (
              <MovieItem
                key={movie.id}
                movie={movie}
                removeHandler={() => removeFromWatched(movie.id)}
              />
            ))
          )}
        </div>
      </Section>

      {/* Reviews */}
      <Section title="Your Reviews">
        <div className="flex flex-wrap gap-6">
          {profile.reviews?.length === 0 ? (
            <div className="text-gray-400">No reviews yet.</div>
          ) : reviewMovies.length === 0 ? (
            <div className="text-gray-400">Loading review movies...</div>
          ) : (
            profile.reviews.map((review, index) => {
              const movie = reviewMovies.find(m => m && m.id === review.tmdbId);
              return movie ? (
                <MovieItem
                  key={`${review.tmdbId}-${index}`}
                  movie={movie}
                  extra={
                    <div className="mt-2 text-sm text-yellow-400">
                      <div>Rating: {review.rating}/5</div>
                      <div>{review.comment}</div>
                    </div>
                  }
                />
              ) : null;
            })
          )}
        </div>
      </Section>
    </div>
  );
};

export default Profile;
