import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Ratings.css";

function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempComment, setTempComment] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const res = await api.post("/api/getMoviesSeen", { userId });
      setRatings(res.data.movies || []);
    } catch (err) {
      console.error("Error loading ratings:", err);
    }
  };

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setTempRating(movie.rating || 0);
    setTempComment(movie.comment || "");
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const saveChanges = async () => {
    if (!selectedMovie) return;

    try {
      await api.post("/api/addupdateRating", {
        userId,
        tmdbId: selectedMovie.tmdbId,
        title: selectedMovie.title,
        year: selectedMovie.year,
        poster: selectedMovie.poster,
        overview: selectedMovie.overview,
        rating: tempRating,
        comment: tempComment,
        dateViewed: selectedMovie.dateViewed || new Date().toISOString(),
      });

      loadRatings();
      closeModal();
    } catch (err) {
      console.error("Error updating rating:", err);
    }
  };

  const deleteRating = async () => {
    if (!selectedMovie) return;

    try {
      await api.post("/api/deleteMovieSeen", {
        userId,
        tmdbId: selectedMovie.tmdbId,
      });

      setRatings((prev) =>
        prev.filter((m) => m.tmdbId !== selectedMovie.tmdbId)
      );
      closeModal();
    } catch (err) {
      console.error("Error deleting rating:", err);
    }
  };

  const wordCount = tempComment.trim()
    ? tempComment.trim().split(/\s+/).length
    : 0;

  return (
    <div className="ratings-page">
      <h1 className="ratings-title">My Ratings</h1>

      {ratings.length === 0 && (
        <div className="ratings-empty">
          <p>You have not rated any movies yet.</p>
        </div>
      )}

      <div className="ratings-grid">
        {ratings.map((movie) => (
          <div
            key={movie.tmdbId}
            className="ratings-card"
            onClick={() => openModal(movie)}
          >
            <img src={movie.poster} alt={movie.title} />

            <div className="ratings-info">
              <h3>{movie.title}</h3>

              <div className="star-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={i <= movie.rating ? "star filled" : "star"}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="movie-comment">{movie.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ⭐ FIXED EDIT MODAL */}
      {selectedMovie && (
        <div className="ratingsModal-overlay">
          <div className="ratingsModal-window">
            <h2>Edit Rating</h2>
            <h3>{selectedMovie.title}</h3>

            <div className="ratingsModal-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={i <= tempRating ? "star filled" : "star"}
                  onClick={() => setTempRating(i)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              className="ratingsModal-comment"
              value={tempComment}
              maxLength={350}
              onChange={(e) => {
                const words = e.target.value.split(/\s+/);
                if (words.length <= 50) setTempComment(e.target.value);
              }}
              placeholder="Write your thoughts (max 50 words)..."
            />

            <p className="word-count">{wordCount} / 50 words</p>

            <div className="ratingsModal-buttons">
              <button className="btn-save" onClick={saveChanges}>Save</button>
              <button className="btn-delete" onClick={deleteRating}>Delete</button>
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ratings;
