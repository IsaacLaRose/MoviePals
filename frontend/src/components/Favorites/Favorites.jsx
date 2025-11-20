import React, { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../../services/favoritesService";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Load favorites on mount
  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites(userId);
        setFavorites(data || []); // ensure array
      } catch (err) {
        console.error("Error loading favorites:", err);
      }
    }

    loadFavorites();
  }, [userId]);

  // Remove favorite
  const handleRemove = async (tmdbId) => {
    try {
      await removeFavorite(userId, tmdbId);
      setFavorites((prev) => prev.filter((m) => m.tmdbId !== tmdbId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  return (
    <div className="favorites-page">
      <h1 className="favorites-title">My Favorites ❤️</h1>

      {/* EMPTY STATE */}
      {favorites.length === 0 && (
        <div className="favorites-empty">
          <p>You haven’t added any favorites yet.</p>
          <button className="find-movies-btn" onClick={() => navigate("/search")}>
            Find Movies
          </button>
        </div>
      )}

      {/* FAVORITES GRID */}
      <div className="favorites-grid">
        {favorites.map((movie) => (
          <div key={movie.tmdbId} className="favorites-card">

            {/* Make poster clickable */}
            <img
              src={movie.poster}
              alt={movie.title}
              className="favorites-poster"
              onClick={() => navigate(`/movie/${movie.tmdbId}`)}
            />

            <div className="favorites-info">
              <h3>{movie.title}</h3>

              <p className="favorite-tag">❤️ In Favorites</p>

              <button
                className="remove-btn"
                onClick={() => handleRemove(movie.tmdbId)}
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
