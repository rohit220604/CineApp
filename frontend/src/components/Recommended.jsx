import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Utility to fetch recommendations for a list of movie IDs
const fetchRecommendations = async (movieIds, tmdbApiKey, maxPerMovie = 5, page = 1) => {
  const allRecommendations = [];
  for (const id of movieIds) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${tmdbApiKey}&language=en-US&page=${page}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        allRecommendations.push(
          ...data.results.slice(0, maxPerMovie).map((movie) => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.slice(0, 4) : "N/A",
            poster: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Image",
            description: movie.overview,
          }))
        );
      }
    } catch (err) {
      // Handle error if needed
    }
  }
  return allRecommendations;
};

const fetchPopularMovies = async (tmdbApiKey, page = 1) => {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=en-US&page=${page}`
    );
    const data = await res.json();
    return {
      movies: (data.results || []).map((movie) => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? movie.release_date.slice(0, 4) : "N/A",
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "https://via.placeholder.com/500x750?text=No+Image",
        description: movie.overview,
      })),
      totalPages: data.total_pages || 1,
    };
  } catch (err) {
    return { movies: [], totalPages: 1 };
  }
};

const fetchUserMovieIds = async (backendUrl, token, query) => {
  try {
    const res = await fetch(`${backendUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });
    const { data } = await res.json();
    return data ? data[Object.keys(data)[0]] : [];
  } catch (err) {
    return [];
  }
};

const Recommended = () => {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recPage, setRecPage] = useState(1);
  const [popPage, setPopPage] = useState(1);
  const [recHasMore, setRecHasMore] = useState(true);
  const [popHasMore, setPopHasMore] = useState(true);
  const [userMovieIds, setUserMovieIds] = useState([]);
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [recommendationsAttempted, setRecommendationsAttempted] = useState(false);
  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // Fetch user's saved, watched, and recently visited movie IDs
  useEffect(() => {
    const fetchAllUserMovieIds = async () => {
      const token = localStorage.getItem("token");
      let visited = [];
      try {
        visited = JSON.parse(localStorage.getItem("recentlyVisitedMovies") || "[]");
      } catch {
        visited = [];
      }
      if (!token) {
        setUserMovieIds(visited);
        setRecentlyVisited(visited);
        return;
      }
      const [saved, watched] = await Promise.all([
        fetchUserMovieIds(
          backendUrl,
          token,
          `query { mySavedMovies }`
        ),
        fetchUserMovieIds(
          backendUrl,
          token,
          `query { myWatchedMovies }`
        ),
      ]);
      // Combine and deduplicate IDs (recently visited first)
      const combined = Array.from(
        new Set([
          ...(visited || []),
          ...(saved || []),
          ...(watched || []),
        ])
      );
      setUserMovieIds(combined);
      setRecentlyVisited(visited);
    };
    fetchAllUserMovieIds();
  }, [backendUrl]);

  // Fetch recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      if (userMovieIds.length > 0 && recHasMore) {
        const recs = await fetchRecommendations(userMovieIds, tmdbApiKey, 5, recPage);
        setRecommendedMovies((prev) => [...prev, ...recs]);
        setRecHasMore(recs.length > 0);
        setRecommendationsAttempted(true);
      } else if (userMovieIds.length > 0) {
        setRecommendationsAttempted(true);
      }
      setLoading(false);
    };
    if (userMovieIds.length > 0) {
      loadRecommendations();
    } else {
      setRecommendationsAttempted(true);
    }
    // eslint-disable-next-line
  }, [recPage, tmdbApiKey, userMovieIds.join(",")]);

  // Fetch popular movies
  useEffect(() => {
    const loadPopular = async () => {
      setLoading(true);
      const { movies, totalPages } = await fetchPopularMovies(tmdbApiKey, popPage);
      setPopularMovies((prev) => [...prev, ...movies]);
      setPopHasMore(popPage < totalPages);
      setLoading(false);
    };
    if (
      userMovieIds.length === 0 ||
      (userMovieIds.length > 0 && (!recHasMore || recommendedMovies.length === 0))
    ) {
      loadPopular();
    }
    // eslint-disable-next-line
  }, [popPage, tmdbApiKey, recHasMore, userMovieIds.join(","), recommendedMovies.length]);

  // Reset recommendations and pages when userMovieIds changes
  useEffect(() => {
    setRecommendedMovies([]);
    setPopularMovies([]);
    setRecPage(1);
    setPopPage(1);
    setRecHasMore(true);
    setPopHasMore(true);
    setRecommendationsAttempted(false);
  }, [userMovieIds.join(",")]);

  // Infinite scroll handler
  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.offsetHeight
      ) {
        if (recHasMore && recommendedMovies.length > 0) {
          setRecPage((prev) => prev + 1);
        } else if (popHasMore) {
          setPopPage((prev) => prev + 1);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [recHasMore, popHasMore, loading, recommendedMovies.length]);

  // Track recently visited movies
  const handleMovieClick = (movieId) => {
    let visited = [];
    try {
      visited = JSON.parse(localStorage.getItem("recentlyVisitedMovies") || "[]");
    } catch {
      visited = [];
    }
    // Add to front, remove duplicates, limit to 10
    const updated = [movieId, ...visited.filter((id) => id !== movieId)].slice(0, 10);
    localStorage.setItem("recentlyVisitedMovies", JSON.stringify(updated));
    setRecentlyVisited(updated);
    // Optionally, update recommendations immediately
    if (!userMovieIds.includes(movieId)) {
      setUserMovieIds((prev) => [movieId, ...prev]);
    }
    navigate(`/movies/${movieId}`);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "32px 48px",
        background: "#181d2a",
        color: "#fff",
        boxSizing: "border-box",
      }}
    >
      {/* Recommended Movies Section */}
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
        Recommended Movies
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 32,
        }}
      >
        {recommendedMovies.map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#22283a",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            onClick={() => handleMovieClick(movie.id)}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: 140,
                height: 210,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: "8px 0 4px" }}>
              {movie.title}
            </h3>
            <span style={{ color: "#8bb4ff", fontSize: 15, marginBottom: 8 }}>
              {movie.year}
            </span>
            <p style={{ fontSize: 15, color: "#b0b4c0", textAlign: "center" }}>
              {movie.description}
            </p>
          </div>
        ))}
      </div>
      {recommendationsAttempted && recommendedMovies.length === 0 && (
        <div style={{ textAlign: "center", margin: "32px 0", color: "#b0b4c0", fontSize: 18 }}>
          No recommendations for now.<br />
          <span style={{ color: "#8bb4ff" }}>
            Explore the popular ones first so we can curate something for you!
          </span>
        </div>
      )}

      {/* Popular Movies Section */}
      <h2 style={{ fontSize: 32, fontWeight: 700, margin: "48px 0 32px" }}>
        Popular Movies
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 32,
        }}
      >
        {popularMovies.map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#22283a",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            onClick={() => handleMovieClick(movie.id)}
          >
            <img
              src={movie.poster}
              alt={movie.title}
              style={{
                width: 140,
                height: 210,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: "8px 0 4px" }}>
              {movie.title}
            </h3>
            <span style={{ color: "#8bb4ff", fontSize: 15, marginBottom: 8 }}>
              {movie.year}
            </span>
            <p style={{ fontSize: 15, color: "#b0b4c0", textAlign: "center" }}>
              {movie.description}
            </p>
          </div>
        ))}
      </div>
      {loading && (
        <div style={{ textAlign: "center", margin: "32px 0", color: "#8bb4ff" }}>
          Loading more movies...
        </div>
      )}
      {!loading && recommendedMovies.length === 0 && popularMovies.length === 0 && (
        <div style={{ textAlign: "center", margin: "32px 0", color: "#b0b4c0" }}>
          No movies available.
        </div>
      )}
      {!recHasMore && !popHasMore && (
        <div style={{ textAlign: "center", margin: "32px 0", color: "#b0b4c0" }}>
          No more movies to load.
        </div>
      )}
    </div>
  );
};

export default Recommended;
