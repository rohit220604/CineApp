import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "./AuthContext"; // <-- Adjust path if needed

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// GraphQL fetch helper
const fetchGraphQL = async (query, variables = {}, token = null) => {
  const res = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
};

const USER_PROFILE_QUERY = `
  query UserProfile($username: String!) {
    userProfile(username: $username) {
      username
      publicName
      followers
      following
      watchedMovies
      savedMovies
    }
  }
`;

const FOLLOW_USER_MUTATION = `
  mutation FollowUser($username: String!) {
    followUser(username: $username) {
      success
    }
  }
`;

const fetchMoviesByIds = async (ids = []) => {
  if (!ids || ids.length === 0) return [];
  const movies = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    })
  );
  return movies.filter(Boolean);
};

const MovieGrid = ({ movies, title }) => (
  <div style={{ marginTop: 40 }}>
    <h3 style={{ fontSize: 22, marginBottom: 12, fontWeight: 600 }}>
      {title} <span style={{ color: "#8bb4ff" }}>({movies.length})</span>
    </h3>
    {movies.length === 0 ? (
      <div style={{ color: "#888", fontSize: 15 }}>No movies found.</div>
    ) : (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#232942",
              borderRadius: 8,
              padding: 12,
              width: 150,
              textAlign: "center",
            }}
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/500x750?text=No+Image"
              }
              alt={movie.title}
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <div style={{ color: "#fff", fontWeight: 500, fontSize: 15 }}>
              {movie.title}
            </div>
            <div style={{ color: "#b0b4c0", fontSize: 13 }}>
              {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Follower = () => {
  const params = useParams();
  const username = params.username;

  // Get current user from AuthContext
  const { user: currentUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [error, setError] = useState("");
  const [followRequested, setFollowRequested] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Viewing profile for username:", username);
    if (currentUser) {
      console.log("Current user from AuthContext:", currentUser);
      console.log("Current user's following list:", currentUser.following);
    } else {
      console.log("No currentUser found");
    }
  }, [username, currentUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const profileRes = await fetchGraphQL(USER_PROFILE_QUERY, { username });
        if (profileRes.errors) throw new Error(profileRes.errors[0].message);
        setProfile(profileRes.data.userProfile);
      } catch (err) {
        setError(err.message || "Error loading profile.");
      }
      setLoading(false);
    };
    if (username) fetchProfile();
  }, [username]);

  useEffect(() => {
    const fetchAllMovies = async () => {
      setMoviesLoading(true);
      if (profile) {
        const [watched, saved] = await Promise.all([
          fetchMoviesByIds(profile.watchedMovies),
          fetchMoviesByIds(profile.savedMovies),
        ]);
        setWatchedMovies(watched);
        setSavedMovies(saved);
      } else {
        setWatchedMovies([]);
        setSavedMovies([]);
      }
      setMoviesLoading(false);
    };
    fetchAllMovies();
  }, [profile]);

  // Check if current user follows this profile
  const isFollowing =
    currentUser &&
    currentUser.following &&
    currentUser.following.includes(username);

  // Don't show follow button for your own profile
  const isOwnProfile = currentUser && currentUser.username === username;

  const handleFollow = async () => {
    setFollowRequested(true);
    try {
      await fetchGraphQL(FOLLOW_USER_MUTATION, { username });
      // Optionally: update local state or refetch currentUser/profile
    } catch {
      setFollowRequested(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "32px 48px",
        background: "#181d2a",
        color: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      {loading ? (
        <div style={{ color: "#8bb4ff", fontSize: 18 }}>Loading profile...</div>
      ) : error ? (
        <div style={{ color: "red", fontSize: 16 }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 4 }}>
              {profile?.publicName || profile?.username}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 20,
                  color: "#8bb4ff",
                  marginLeft: 12,
                }}
              >
                @{profile?.username}
              </span>
            </h2>
            {/* Follow Button */}
            {!isOwnProfile && !isFollowing && (
              <button
                style={{
                  padding: "8px 20px",
                  background: followRequested ? "#888" : "#8bb4ff",
                  color: "#181d2a",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: followRequested ? "not-allowed" : "pointer",
                  marginTop: 10,
                }}
                disabled={followRequested}
                onClick={handleFollow}
              >
                {followRequested ? "Requested" : "Follow"}
              </button>
            )}
          </div>
          {/* Only show details if following or own profile */}
          {(isFollowing || isOwnProfile) ? (
            <>
              {/* Followers and Following Sections Side by Side */}
              <div style={{ display: "flex", gap: 40 }}>
                {/* Followers Section */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 22, marginBottom: 12, fontWeight: 600 }}>
                    Followers{" "}
                    <span style={{ color: "#8bb4ff" }}>
                      ({profile?.followers?.length || 0})
                    </span>
                  </h3>
                  {profile?.followers?.length === 0 ? (
                    <div style={{ color: "#888", fontSize: 15 }}>
                      No followers yet.
                    </div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {profile.followers.map((uname) => (
                        <li
                          key={uname}
                          style={{
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: "1px solid #22283a",
                          }}
                        >
                          <span
                            style={{
                              color: "#8bb4ff",
                              fontSize: 16,
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() => navigate(`/profile/${uname}`)}
                            title={`View @${uname}'s profile`}
                          >
                            @{uname}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Following Section */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 22, marginBottom: 12, fontWeight: 600 }}>
                    Following{" "}
                    <span style={{ color: "#8bb4ff" }}>
                      ({profile?.following?.length || 0})
                    </span>
                  </h3>
                  {profile?.following?.length === 0 ? (
                    <div style={{ color: "#888", fontSize: 15 }}>
                      Not following anyone yet.
                    </div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {profile.following.map((uname) => (
                        <li
                          key={uname}
                          style={{
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: "1px solid #22283a",
                          }}
                        >
                          <span
                            style={{
                              color: "#8bb4ff",
                              fontSize: 16,
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() => navigate(`/profile/${uname}`)}
                            title={`View @${uname}'s profile`}
                          >
                            @{uname}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Watched & Saved Movies */}
              {moviesLoading ? (
                <div style={{ color: "#8bb4ff", marginTop: 40 }}>
                  Loading movies...
                </div>
              ) : (
                <>
                  <MovieGrid movies={watchedMovies} title="Watched Movies" />
                  <MovieGrid movies={savedMovies} title="Saved Movies" />
                </>
              )}
            </>
          ) : (
            !isOwnProfile && (
              <div style={{ color: "#888", fontSize: 16, marginTop: 30 }}>
                You must follow this user to see their followers, following, and watched films.
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Follower;
