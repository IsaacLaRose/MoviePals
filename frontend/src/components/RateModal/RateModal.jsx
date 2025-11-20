import React, { useState } from "react";
import api from "../../services/api";
import "./RateModal.css";

function RateModal({ movie, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const userId = localStorage.getItem("userId");

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
      console.error(err);
      alert("Failed to add favorite.");
    }
  };

  const saveRating = () => {
    if (!rating) return alert("Please give a rating first.");
    onSave(rating, comment);
  };

  return (
    <div className="rateModal-overlay">
      <div className="rateModal-window">
        <h2 className="rateModal-title">Rate {movie.title}</h2>

        <img
          src={movie.poster}
          alt={movie.title}
          className="rateModal-poster"
        />

        <div className="rateModal-stars">
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

        <textarea
          className="rateModal-comment"
          placeholder="Write a quick review... (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="rateModal-buttons">
          <button className="fav-btn" onClick={addToFavorites}>❤️ Favorite</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={saveRating}>Save Rating</button>
        </div>
      </div>
    </div>
  );
}

export default RateModal;
