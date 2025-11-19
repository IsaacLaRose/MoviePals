import React, { useState } from "react";
import "./Ratings.css";

function Ratings() {
  const [ratings, setRatings] = useState([
  {
    id: 1,
    title: "The Dark Knight",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 5,
    comment: "One of the greatest superhero films ever made."
  },
  {
    id: 2,
    title: "Interstellar",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 4,
    comment: "Amazing soundtrack and emotional depth."
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: 5,
    comment: "Pure nostalgia and insane crowd energy."
  },
  {
    id: 4,
    title: "Inception",
    poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    rating: 5,
    comment: "Mind-bending in the best way."
  },
  {
    id: 5,
    title: "The Social Network",
    poster: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
    rating: 4,
    comment: "Oscar-worthy dialogue. Zuckerberg era defined."
  },
  {
    id: 6,
    title: "Avatar",
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    rating: 4,
    comment: "Visuals still unmatched."
  },
  {
    id: 7,
    title: "The Matrix",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 5,
    comment: "A genre-defining sci-fi masterpiece."
  },
  {
    id: 8,
    title: "Joker",
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    rating: 5,
    comment: "A dark, powerful character study."
  },
  {
    id: 9,
    title: "The Wolf of Wall Street",
    poster: "https://image.tmdb.org/t/p/w500/pWHf4khOloNVfCxscsXFj3jj6gP.jpg",
    rating: 5,
    comment: "DiCaprio unleashed."
  },
  {
    id: 10,
    title: "Tenet",
    poster: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
    rating: 4,
    comment: "A mind-bending time inversion trip."
  },
  {
    id: 11,
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    rating: 5,
    comment: "A haunting portrait of a complicated genius."
  },

  {
    id: 12,
    title: "The Shawshank Redemption",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 5,
    comment: "Widely considered the greatest film ever made."
  },
  {
    id: 13,
    title: "La La Land",
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    rating: 4,
    comment: "A colorful emotional ride."
  },
  {
    id: 14,
    title: "Shutter Island",
    poster: "https://image.tmdb.org/t/p/w500/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
    rating: 5,
    comment: "Insanely clever twist."
  },
  {
    id: 15,
    title: "The Avengers",
    poster: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    rating: 4,
    comment: "The movie that changed everything."
  },
  {
    id: 16,
    title: "The Batman",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 5,
    comment: "Dark, grounded, and beautifully shot."
  }
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
