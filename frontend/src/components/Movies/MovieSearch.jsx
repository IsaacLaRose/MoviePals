import React, { useState } from "react";
import { searchMovies } from "../../services/movieService";
import RateModal from "../RateModal/RateModal";
import "./Movies.css";

function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setError("Please enter a movie name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await searchMovies(searchTerm);

      // ⭐ FIX TMDB IMAGE FIELD
      const formatted = data.results.map((m) => ({
        ...m,
        poster: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : null,
      }));

      setMovies(formatted);

      if (formatted.length === 0) {
        setError("No movies found. Try a different search.");
      }
    } catch (err) {
      setError("Failed to search movies. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ open modal
  const openRatingModal = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  };

  // ⭐ save to localStorage (temporary backend)
  const saveRating = (stars, comment) => {
    const ratingData = {
      ...selectedMovie,
      rating: stars,
      comment,
    };

    let stored = JSON.parse(localStorage.getItem("ratings") || "[]");

    const existingIndex = stored.findIndex((m) => m.id === selectedMovie.id);

    if (existingIndex >= 0) {
      stored[existingIndex] = ratingData;
    } else {
      stored.push(ratingData);
    }

    localStorage.setItem("ratings", JSON.stringify(stored));

    setShowModal(false);
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        {/* WELCOME HEADER */}
        <div className="welcome-section">
          <h1>Welcome Back!</h1>
          <p>What movie you like to rate today?</p>

          <div className="action-buttons">
            <button className="action-btn" onClick={() => (window.location.href = "/ratings")}>
              ⭐ My Ratings
            </button>

            <button className="action-btn" onClick={() => (window.location.href = "/favorites")}>
              ❤️ Favorites
            </button>
          </div>
        </div>

        {/* 6-box grid */}
        <div className="dashboard-grid">
          <div className="dashboard-box" onClick={() => (window.location.href = "/ratings")}>
            <h2>16</h2>
            <p>Movies Rated</p>
          </div>

          <div className="dashboard-box" onClick={() => (window.location.href = "/favorites")}>
            <h2>9</h2>
            <p>Favorites</p>
          </div>

          <div className="dashboard-box" onClick={() => (window.location.href = "/trending")}>
            <h3>🔥 Trending Picks</h3>
            <p>Popular movies recommended for you.</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="search-section">
          <h1>Search Movies</h1>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Enter movie name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </div>

        {/* SEARCH RESULTS */}
        <div className="movie-results">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img
                src={
                  movie.poster
                    ? movie.poster
                    : "https://via.placeholder.com/300x450?text=No+Poster"
                }
                alt={movie.title}
                className="movie-poster"
              />

              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-year">{movie.release_date?.slice(0, 4)}</p>

                <button className="rate-button" onClick={() => openRatingModal(movie)}>
                  Rate This Movie
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {movies.length === 0 && !loading && !error && (
          <div className="empty-state">
            <p>Search for a movie to get started!</p>
          </div>
        )}
      </div>

      {/* ⭐ RATING MODAL */}
      {showModal && (
        <RateModal movie={selectedMovie} onClose={() => setShowModal(false)} onSave={saveRating} />
      )}
    </div>
  );
}

export default MovieSearch;
