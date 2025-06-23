import React from "react";

// Dummy data for demonstration
const recommendedMovies = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    poster:
      "https://m.media-amazon.com/images/I/51s+6lQb6vL._AC_SY679_.jpg",
    description: "A thief who steals corporate secrets through dream-sharing technology.",
  },
  {
    id: 2,
    title: "The Dark Knight",
    year: 2008,
    poster:
      "https://m.media-amazon.com/images/I/51k0qa6qGKL._AC_SY679_.jpg",
    description: "Batman faces the Joker, a criminal mastermind.",
  },
  {
    id: 3,
    title: "Interstellar",
    year: 2014,
    poster:
      "https://m.media-amazon.com/images/I/71n58KpH6rL._AC_SY679_.jpg",
    description: "A team travels through a wormhole in search of a new home for humanity.",
  },
  {
    id: 4,
    title: "Parasite",
    year: 2019,
    poster:
      "https://m.media-amazon.com/images/I/71c8YQe7qNL._AC_SY679_.jpg",
    description: "A poor family schemes to become employed by a wealthy family.",
  },
  {
    id: 5,
    title: "The Matrix",
    year: 1999,
    poster:
      "https://m.media-amazon.com/images/I/51EG732BV3L._AC_SY679_.jpg",
    description: "A computer hacker learns about the true nature of reality.",
  },
];

const Recommended = () => {
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
            }}
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
    </div>
  );
};

export default Recommended;
