import React, { useState, useEffect } from "react";
import RateModal from "../RateModal/RateModal";
import "./Trending.css";

function Trending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ⭐ Load trending movies from TMDB
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          "https://api.themoviedb.org/3/trending/movie/day?api_key=1dbb4c5340e375b5d60077d298651c2a"
        );
        const data = await res.json();

        const formatted = data.results.map((m) => ({
          id: m.id,
          title: m.title,
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : null,
          year: m.release_date ? m.release_date.slice(0, 4) : "N/A",
        }));

        setMovies(formatted);
      } catch (err) {
        console.error("Failed to load trending movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // ⭐ Open modal
  const openRatingModal = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  // ⭐ Save rating to localStorage
  const saveRating = (stars, comment) => {
    const ratingData = {
      ...selectedMovie,
      rating: stars,
      comment,
    };

    let stored = JSON.parse(localStorage.getItem("ratings") || "[]");

    const exists = stored.findIndex((m) => m.id === selectedMovie.id);

    if (exists >= 0) {
      stored[exists] = ratingData;
    } else {
      stored.push(ratingData);
    }

    localStorage.setItem("ratings", JSON.stringify(stored));
    setShowModal(false);
  };

  if (loading) return <div className="loading">Loading trending movies...</div>;

  return (
    <div className="trending-page">
      <h1 className="trending-title">🔥 Trending Picks</h1>

      <div className="trending-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="trending-card">
            <img
              src={
                movie.poster ||
                "https://via.placeholder.com/300x450?text=No+Poster"
              }
              alt={movie.title}
              className="trending-poster"
            />

            <h3 className="trending-movie-title">{movie.title}</h3>
            <p className="trending-year">{movie.year}</p>

            <button
              className="rate-button"
              onClick={() => openRatingModal(movie)}
            >
              Rate This Movie
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <RateModal
          movie={selectedMovie}
          onClose={() => setShowModal(false)}
          onSave={saveRating}
        />
      )}
    </div>
  );
}

export default Trending;
