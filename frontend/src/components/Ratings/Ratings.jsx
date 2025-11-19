import React, { useState } from "react";
import "./Ratings.css";

function Ratings() {
  const [ratings, setRatings] = useState([
    {
      id: 1,
      title: "The Dark Knight",
      poster:
        "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      rating: 5,
      comment: "One of the greatest superhero films ever made.",
    },
    {
      id: 2,
      title: "Interstellar",
      poster:
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      rating: 4,
      comment: "Amazing soundtrack and emotional depth.",
    },
    {
      id: 3,
      title: "Dune Part Two",
      poster:
        "https://image.tmdb.org/t/p/w500/8b8g8xOmV5U1v7lZNVYFl1pZb6C.jpg",
      rating: 5,
      comment: "Epic scale and breathtaking visuals.",
    },
  ]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempComment, setTempComment] = useState("");

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setTempRating(movie.rating);
    setTempComment(movie.comment);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const saveChanges = () => {
    setRatings((prev) =>
      prev.map((m) =>
        m.id === selectedMovie.id
          ? { ...m, rating: tempRating, comment: tempComment }
          : m
      )
    );
    closeModal();
  };

  const deleteRating = () => {
    setRatings((prev) => prev.filter((m) => m.id !== selectedMovie.id));
    closeModal();
  };

  // Count words (max 50)
  const wordCount = tempComment.trim() ? tempComment.trim().split(/\s+/).length : 0;

  return (
    <div className="ratings-page">
      <h1 className="ratings-title">My Ratings</h1>

      <div className="ratings-grid">
        {ratings.map((movie) => (
          <div
            key={movie.id}
            className="ratings-card"
            onClick={() => openModal(movie)}
          >
            <img src={movie.poster} alt={movie.title} />

            <div className="ratings-info">
              <h3>{movie.title}</h3>

              {/* Gold Stars */}
              <div className="star-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={i <= movie.rating ? "star filled" : "star"}>
                    ★
                  </span>
                ))}
              </div>

              {/* Display Comment */}
              <p className="movie-comment">{movie.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* =============================
           MODAL
      ============================== */}
      {selectedMovie && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Edit Rating</h2>
            <h3>{selectedMovie.title}</h3>

            {/* Editable Stars */}
            <div className="star-select">
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

            {/* Comment Input */}
            <textarea
              className="comment-box"
              value={tempComment}
              maxLength={350} // for safety
              onChange={(e) => {
                const words = e.target.value.split(/\s+/);
                if (words.length <= 50) {
                  setTempComment(e.target.value);
                }
              }}
              placeholder="Write your thoughts (max 50 words)..."
            />

            <p className="word-count">{wordCount} / 50 words</p>

            <div className="modal-buttons">
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
