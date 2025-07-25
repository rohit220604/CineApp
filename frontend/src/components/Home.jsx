import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [actionStatus, setActionStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const loader = useRef(null);
  const [watchedMovies, setWatchedMovies] = useState(new Set());
  const [savedMovies, setSavedMovies] = useState(new Set());

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch movies
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

  // Fetch saved movies from backend
  const fetchSavedMovies = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query {
              mySavedMovies
            }
          `,
        }),
      });
      const { data } = await res.json();
      if (data && data.mySavedMovies) {
        setSavedMovies(new Set(data.mySavedMovies));
      }
    } catch (err) {
      // Handle error if needed
    }
  }, []);

  // Fetch watched movies from backend
  const fetchWatchedMovies = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query {
              myWatchedMovies
            }
          `,
        }),
      });
      const { data } = await res.json();
      if (data && data.myWatchedMovies) {
        setWatchedMovies(new Set(data.myWatchedMovies));
      }
    } catch (err) {
      // Handle error if needed
    }
  }, []);

  // Fetch movies on mount or page/search change
  useEffect(() => {
    if (!searching) fetchMovies();
  }, [page, searching, fetchMovies]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading || searching) return;
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
  }, [hasMore, loading, searching]);

  // Fetch saved and watched movies on login/mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedMovies();
      fetchWatchedMovies();
    } else {
      setSavedMovies(new Set());
      setWatchedMovies(new Set());
    }
  }, [isLoggedIn, fetchSavedMovies, fetchWatchedMovies]);

  // --- Backend Actions ---
  const sendToBackend = async (mutation, variables, movieId, successMsg, refetchFn) => {
    setActionStatus((prev) => ({ ...prev, [movieId]: "Loading..." }));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/graphql`, {
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
        if (refetchFn) refetchFn();
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
      }`,
      {
        tmdbId: movie.id,
      },
      movie.id,
      "Saved!",
      fetchSavedMovies
    );
  };

  // Unsave a movie
  const handleUnsave = async (movie) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${backendUrl}/graphql`, {
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
          variables: { tmdbId: movie.id },
        }),
      });
      fetchSavedMovies();
    } catch (error) {
      console.error("Failed to unsave:", error);
    }
  };

  // Mark as watched
  const handlewatched = (movie) => {
    sendToBackend(
      `mutation MarkAsWatched($tmdbId: Int!) {
        markAsWatched(tmdbId: $tmdbId)
      }`,
      {
        tmdbId: movie.id,
      },
      movie.id,
      "Marked as Watched!",
      fetchWatchedMovies
    );
  };

  // Unmark as Watched
  const removeFromWatched = async (movie) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${backendUrl}/graphql`, {
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
          variables: { tmdbId: movie.id },
        }),
      });
      fetchWatchedMovies();
    } catch (error) {
      console.error("Failed to remove from watched:", error);
    }
  };

  // --- Search Handler ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
          searchQuery
        )}&page=1`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setSearchResults([]);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearching(false);
    setPage(1);
  };

  // --- Render ---
  return (
    <div className="bg-[#101624] min-h-screen px-4 py-8">
      <div className="flex items-center mb-8 gap-4 justify-between flex-wrap">
        <h1 className="text-3xl font-bold text-blue-400 whitespace-nowrap">
          Popular Movies
        </h1>
        <form
          className="flex gap-2"
          onSubmit={handleSearch}
          autoComplete="off"
          style={{ minWidth: 0 }}
        >
          <input
            type="text"
            placeholder="Search movies"
            className="px-3 py-2 rounded bg-gray-800 text-white w-64 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
          {searching && (
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
          )}
        </form>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {(searching ? searchResults : movies).map((movie) => (
          <Link
            to={`/movies/${movie.id}`}
            key={movie.id}
            className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-blue-500 transition-shadow"
            style={{ textDecoration: "none" }}
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
              {isLoggedIn && (
                <div className="mt-auto flex space-x-2">
                  {savedMovies.has(movie.id) ? (
                    <button
                      className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded transition text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnsave(movie);
                      }}
                    >
                      Unsave
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSave(movie);
                      }}
                    >
                      Save
                    </button>
                  )}

                  {watchedMovies.has(movie.id) ? (
                    <button
                      className="bg-yellow-700 hover:bg-yellow-800 text-white px-3 py-1 rounded transition text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWatched(movie);
                      }}
                    >
                      Unmark as Watched
                    </button>
                  ) : (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlewatched(movie);
                      }}
                    >
                      Watched
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2 min-h-[20px]">
                {actionStatus[movie.id] && (
                  <span className="text-xs text-green-400">{actionStatus[movie.id]}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!searching && (
        <div ref={loader} className="flex justify-center py-8">
          {loading && <span className="text-gray-300">Loading more movies...</span>}
          {!hasMore && <span className="text-gray-500">No more movies to load.</span>}
        </div>
      )}
      {searching && !loading && searchResults.length === 0 && (
        <div className="text-gray-400 text-center mt-8">No results found.</div>
      )}
    </div>
  );
};

export default Home;
