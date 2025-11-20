import React, { useState } from "react";
import api from "../../services/api";
import "./RateModal.css";

function RateModal({ movie, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const userId = localStorage.getItem("userId");

  // ❤️ ADD TO FAVORITES
  const addToFavorites = async () => {
    try {
      await api.post("/api/addFavorite", {
        userId,
        tmdbId: movie.id,
        title: movie.title,
        poster: movie.poster,
        year: movie.release_date?.slice(0, 4),
        overview: movie.overview,
        manuallyAdded: true,
      });

      alert("❤️ Added to Favorites!");
    } catch (err) {
      console.error("Error adding favorite:", err);
      alert("Failed to add to favorites.");
    }
  };

  // ⭐ Save button only saves rating
  const saveRating = () => {
    if (!rating) {
      alert("Please pick a rating before saving.");
      return;
    }

    onSave(rating, comment);
  };

  return (
    <div className="rate-modal-overlay">
      <div className="rate-modal">
        <h2>Rate {movie.title}</h2>

        {/* Poster */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="rate-modal-poster"
        />

        {/* ⭐ STAR SELECTOR */}
        <div className="star-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={n <= rating ? "star filled" : "star"}
              onClick={() => setRating(n)}
            >
              ★
            </span>
          ))}
        </div>

        {/* COMMENT BOX */}
        <textarea
          className="rate-comment"
          placeholder="Write a quick review... (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* BUTTON ROW */}
        <div className="modal-buttons">
          <button className="fav-btn" onClick={addToFavorites}>
            ❤️ Favorite
          </button>

          <button className="close-modal-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="save-rating-btn" onClick={saveRating}>
            Save Rating
          </button>
        </div>
      </div>
    </div>
  );
}

export default RateModal;
