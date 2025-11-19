import React, { useState } from "react";
import "./Watchlist.css";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([
    {
      id: 1,
      title: "Avatar 3",
      poster:
        "https://image.tmdb.org/t/p/w500/8pJ3lZQzQf3N7kLBXHgG6wRMNzp.jpg",
    },
    {
      id: 2,
      title: "The Batman 2",
      poster:
        "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    },
    {
      id: 3,
      title: "Gladiator II",
      poster:
        "https://image.tmdb.org/t/p/w500/2pCv7kQ9bTjJyjv6eEnzuTglx0O.jpg",
    },
  ]);

  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter((movie) => movie.id !== id));
  };

  return (
    <div className="watchlist-page">
      <h1 className="watchlist-title">My Watchlist</h1>

      <div className="watchlist-grid">
        {watchlist.map((movie) => (
          <div key={movie.id} className="watchlist-card">
            <img src={movie.poster} alt={movie.title} />

            <div className="watchlist-info">
              <h3>{movie.title}</h3>

              <button
                className="remove-btn"
                onClick={() => removeFromWatchlist(movie.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {watchlist.length === 0 && (
        <p className="empty-message">Your Watchlist is empty!</p>
      )}
    </div>
  );
}

export default Watchlist;
