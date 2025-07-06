import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Star colors
const STAR_COLOR_FILLED = "#F2C265";
const STAR_COLOR_EMPTY = "#a9a9a9";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Helper to render stars for a given rating
function StarDisplay({ rating }) {
  return (
    <div className="flex items-center ml-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: rating >= star ? STAR_COLOR_FILLED : STAR_COLOR_EMPTY,
            fontSize: "1.3rem",
            marginLeft: star === 1 ? 0 : "0.1rem"
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Add Review Form State
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  // Load More state
  const INITIAL_COUNT = 3;
  const LOAD_MORE_COUNT = 5;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // Fetch movie and reviews
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(setMovie);

    fetchReviews();
  }, [id]);

  const fetchReviews = () => {
    fetch(`${backendUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query($tmdbId: Int!) {
            reviewsForMovie(tmdbId: $tmdbId) {
              id
              rating
              comment
              createdAt
              user { username }
            }
          }
        `,
        variables: { tmdbId: Number(id) }
      })
    })
      .then(res => res.json())
      .then(data => {
        setReviews(data.data.reviewsForMovie);
        setVisibleCount(INITIAL_COUNT); // Reset visible count when new reviews are fetched
      });
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitMsg("Please enter a comment.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      // Not logged in, redirect to login page
      navigate("/login", { replace: true });
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    const res = await fetch(`${backendUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation AddReview($tmdbId: Int!, $rating: Int!, $comment: String!) {
            addReview(tmdbId: $tmdbId, rating: $rating, comment: $comment) {
              id
            }
          }
        `,
        variables: {
          tmdbId: Number(id),
          rating: Number(rating),
          comment: comment.trim(),
        }
      })
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.errors) {
      setSubmitMsg("Failed to submit review. Please try again.");
    } else {
      setSubmitMsg("Review submitted!");
      setComment("");
      setRating(5);
      setHover(null);
      fetchReviews();
    }
    setTimeout(() => setSubmitMsg(""), 2000);
  };

  // Handler for Load More button
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, reviews.length));
  };

  if (!movie) return (
    <div className="bg-[#101624] min-h-screen flex items-center justify-center">
      <div className="text-gray-300 text-lg">Loading...</div>
    </div>
  );

  return (
    <div className="bg-[#101624] min-h-screen w-full p-0 m-0">
      {/* Top section: Poster + Details */}
      <div className="flex flex-col md:flex-row w-full h-full px-8 pt-12 gap-12">
        {/* Poster */}
        <div className="flex-shrink-0 flex justify-center items-start w-full md:w-1/3">
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Image"
            }
            alt={movie.title}
            className="w-72 h-auto rounded-lg shadow-lg object-cover mb-8 md:mb-0"
          />
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col justify-start">
          <h1 className="text-4xl font-bold text-blue-300 mb-2">{movie.title}</h1>
          <p className="text-gray-400 mb-2 text-lg">
            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
          </p>
          <p className="text-gray-200 mb-4 text-base">{movie.overview}</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-yellow-400 font-semibold text-lg">
              ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
            </span>
            <span className="text-gray-400 text-base">
              ({movie.vote_count || 0} votes)
            </span>
          </div>
          <div className="text-gray-400 text-base mb-2">
            Genres:{" "}
            {movie.genres
              ? movie.genres.map(g => g.name).join(", ")
              : "N/A"}
          </div>
          <div className="text-gray-400 text-base mb-6">
            Runtime: {movie.runtime ? `${movie.runtime} min` : "N/A"}
          </div>
        </div>
      </div>
      {/* Add Review Section */}
      <div className="w-full px-8 mt-4 mb-8">
        <form
          onSubmit={handleReviewSubmit}
          className="bg-gray-900 rounded-lg shadow p-6 flex flex-col gap-4 w-full"
        >
          <h3 className="text-xl font-semibold text-blue-300 mb-2">Add Your Review</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            <label className="text-gray-200 font-semibold" htmlFor="comment">
              Comment:
            </label>
            <textarea
              id="comment"
              className="flex-1 px-2 py-1 rounded bg-gray-800 text-white resize-none w-full md:w-auto"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={2}
              required
              placeholder="Write your thoughts..."
            />
            {/* 5-Star Rating Input after comment */}
            <label className="text-gray-200 font-semibold ml-0 md:ml-4" htmlFor="rating">
              Rating:
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  className="bg-transparent border-none p-0 cursor-pointer outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <span
                    style={{
                      color: (hover || rating) >= star ? STAR_COLOR_FILLED : STAR_COLOR_EMPTY,
                      fontSize: "2rem",
                      transition: "color 0.1s",
                    }}
                  >
                    ★
                  </span>
                </button>
              ))}
              <span className="text-gray-300 ml-2">{rating} / 5</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            {submitMsg && (
              <span className="text-green-400 text-sm">{submitMsg}</span>
            )}
          </div>
        </form>
      </div>
      {/* Reviews: Full width */}
      <div className="w-full px-8 pb-12">
        <h2 className="text-2xl text-blue-300 font-semibold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-gray-500 text-base">No reviews yet.</div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {reviews.slice(0, visibleCount).map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-800 rounded-lg shadow flex flex-col"
                >
                  {/* Username + Stars Row */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-400 font-bold">{review.user.username}</span>
                    <StarDisplay rating={review.rating} />
                  </div>
                  {/* Timestamp */}
                  <div className="text-gray-400 text-xs mb-1">
                    {review.createdAt && !isNaN(Date.parse(review.createdAt))
                      ? new Date(review.createdAt).toLocaleString()
                      : ""}
                  </div>
                  {/* Comment */}
                  <div className="text-gray-300 text-sm">{review.comment}</div>
                </div>
              ))}
            </div>
            {visibleCount < reviews.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
