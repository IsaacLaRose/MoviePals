import React, { useState, useEffect } from "react";
import "./RateModal.css";

function RateModal({ movie, onClose, onSave }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (movie?.rating) setStars(movie.rating);
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="rate-modal-overlay" onClick={onClose}>
      <div className="rate-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Rate: {movie.title}</h2>

        {/* ⭐ GOLD STARS */}
        <div className="star-row">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={`star ${(hover || stars) >= num ? "filled" : ""}`}
              onMouseEnter={() => setHover(num)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(num)}
            >
              ★
            </span>
          ))}
        </div>

        {/* COMMENT BOX */}
        <textarea
          maxLength={200}
          className="rate-comment"
          placeholder="Add an optional comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          className="save-rating-btn"
          onClick={() => onSave(stars, comment)}
        >
          Save Rating
        </button>

        <button className="close-modal-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default RateModal;
