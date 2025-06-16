import React, { useEffect, useState, useRef, useCallback } from "react";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [actionStatus, setActionStatus] = useState({}); // { [movieId]: "Saved!" }
  const loader = useRef(null);

  const fetchMovies = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setMovies((prev) => [...prev, ...data.results]);
        setHasMore(page < data.total_pages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setHasMore(false);
    }
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    fetchMovies();
  }, [page]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loader.current) {
      observer.observe(loader.current);
    }
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [hasMore, loading]);

  // --- Backend Actions ---
  const sendToBackend = async (mutation, variables, movieId, successMsg) => {
    setActionStatus((prev) => ({ ...prev, [movieId]: "Loading..." }));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });
      const { data, errors } = await res.json();
      if (errors && errors.length > 0) {
        setActionStatus((prev) => ({
          ...prev,
          [movieId]: `Error: ${errors[0].message}`,
        }));
      } else {
        setActionStatus((prev) => ({
          ...prev,
          [movieId]: successMsg,
        }));
      }
      setTimeout(() => {
        setActionStatus((prev) => ({ ...prev, [movieId]: "" }));
      }, 2000);
    } catch (err) {
      setActionStatus((prev) => ({
        ...prev,
        [movieId]: "Network error",
      }));
    }
  };

  // Save for later
  const handleSave = (movie) => {
    sendToBackend(
      `mutation SaveForLater($tmdbId: Int!) {
  saveForLater(tmdbId: $tmdbId)
}
`,
      {
        tmdbId: movie.id,
        title: movie.title,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",
        year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null,
      },
      movie.id,
      "Saved!"
    );
  };

  // Mark as watched
  const handleWatchLater = (movie) => {
    sendToBackend(
      `mutation MarkAsWatched($tmdbId: Int!) {
  markAsWatched(tmdbId: $tmdbId)
}
`,
      {
        tmdbId: movie.id,
        title: movie.title,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "",
        year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null,
      },
      movie.id,
      "Marked as Watched!"
    );
  };

  // Add review (simple demo: just a default review, you can expand this)
  const handleReview = (movie) => {
    const comment = prompt("Write your review for " + movie.title + ":");
    if (!comment) return;
    sendToBackend(
      `mutation AddReview($tmdbId: Int!, $rating: Int!, $comment: String!) {
        addReview(tmdbId: $tmdbId, rating: $rating, comment: $comment) {
          id
        }
      }`,
      {
        tmdbId: movie.id,
        rating: 5, // You can make this dynamic
        comment,
      },
      movie.id,
      "Review Added!"
    );
  };

  return (
    <div className="bg-[#101624] min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">Popular Movies</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col"
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/500x750?text=No+Image"
              }
              alt={movie.title}
              className="h-72 object-cover w-full"
            />
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">
                {movie.title}
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
              </p>
              <div className="mt-auto flex space-x-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm"
                  onClick={() => handleSave(movie)}
                >
                  Save
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition text-sm"
                  onClick={() => handleWatchLater(movie)}
                >
                  Watch Later
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded transition text-sm"
                  onClick={() => handleReview(movie)}
                >
                  Review
                </button>
              </div>
              <div className="mt-2 min-h-[20px]">
                {actionStatus[movie.id] && (
                  <span className="text-xs text-green-400">{actionStatus[movie.id]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={loader} className="flex justify-center py-8">
        {loading && <span className="text-gray-300">Loading more movies...</span>}
        {!hasMore && <span className="text-gray-500">No more movies to load.</span>}
      </div>
    </div>
  );
};

export default Home;
