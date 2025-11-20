import React, { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../../services/favoritesService";
import "./Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites(userId);
        setFavorites(data);
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    }

    loadFavorites();
  }, [userId]);

  const handleRemove = async (tmdbId) => {
    await removeFavorite(userId, tmdbId);
    setFavorites((prev) => prev.filter((m) => m.tmdbId !== tmdbId));
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">My Favorites</h1>

      <div className="favorites-grid">
        {favorites.map((movie) => (
          <div key={movie.tmdbId} className="favorites-card">
            <img src={movie.poster} alt={movie.title} />

            <div className="favorites-info">
              <h3>{movie.title}</h3>

              <p className="favorite-heart">❤️ Favorite</p>

              <button
                className="remove-btn"
                onClick={() => handleRemove(movie.tmdbId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {favorites.length === 0 && (
          <p className="favorites-empty">You have no favorites yet.</p>
        )}
      </div>
    </div>
  );
}

export default Favorites;
