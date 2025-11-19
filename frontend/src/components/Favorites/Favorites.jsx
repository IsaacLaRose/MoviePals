import React, { useState } from "react";
import "./Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "The Dark Knight",
      poster:
        "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    },
    {
      id: 2,
      title: "Interstellar",
      poster:
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
    {
      id: 3,
      title: "Dune: Part Two",
      poster:
        "https://image.tmdb.org/t/p/w500/8b8g8xOmV5U1v7lZNVYFl1pZb6C.jpg",
    },
  ]);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter((movie) => movie.id !== id));
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">My Favorites</h1>

      <div className="favorites-grid">
        {favorites.map((movie) => (
          <div key={movie.id} className="favorites-card">

            <img src={movie.poster} alt={movie.title} />

            <div className="favorites-info">
              <h3>{movie.title}</h3>

              <p className="favorite-heart">❤️ Favorite</p>

              <button
                className="remove-btn"
                onClick={() => removeFavorite(movie.id)}
              >
                Remove
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
