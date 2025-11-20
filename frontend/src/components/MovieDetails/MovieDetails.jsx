import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetails.css";

import api from "../../services/api";
import { addFavorite, removeFavorite } from "../../services/favoritesService";
import RateModal from "../RateModal/RateModal";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showModal, setShowModal] = useState(false); // ⭐ NEW

  const userId = localStorage.getItem("userId");

  // Fetch movie + check if it's a favorite
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=1dbb4c5340e375b5d60077d298651c2a`
        );
        const data = await res.json();

        if (data.success === false) {
          setError(true);
        } else {
          setMovie(data);

          // ⭐ Check if this movie is already a favorite
          const favRes = await api.post("/api/getFavorites", { userId });
          const isFav = favRes.data.favorites.some((f) => f.tmdbId == id);
          setIsFavorite(isFav);
        }
      } catch (err) {
        setError(true);
      }
    };

    fetchMovie();
  }, [id, userId]);

  // ❤️ Handle favorite toggle
  const toggleFavorite = async () => {
    if (!movie) return;

    if (isFavorite) {
      await removeFavorite(userId, movie.id);
      setIsFavorite(false);
    } else {
      await addFavorite({
        userId,
        tmdbId: movie.id,
        title: movie.title,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        year: movie.release_date?.slice(0, 4),
        overview: movie.overview,
        manuallyAdded: true,
      });
      setIsFavorite(true);
    }
  };

  // ⭐ SAVE RATING (INTEGRATED WITH BACKEND + AUTO-FAVORITE)
  const handleSaveRating = async (stars, comment) => {
    if (!movie) return;

    try {
      // 1️⃣ Save/update rating in backend
      await api.post("/api/addupdateRating", {
        userId,
        tmdbId: movie.id,
        title: movie.title,
        year: movie.release_date?.slice(0, 4),
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        overview: movie.overview,
        rating: stars,
        comment,
        dateViewed: new Date().toISOString()
      });

      setShowModal(false);
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  // Movie not found
  if (error) {
    return (
      <div className="movie-details-page">
        <h2 className="errorMessage">Movie Not Found</h2>
        <p className="errorSub">This movie doesn’t exist or cannot be loaded.</p>
      </div>
    );
  }

  // Loading
  if (!movie) {
    return <div className="loading">Loading movie...</div>;
  }

  return (
    <div className="movie-details-page">
      {/* ===== Poster + Main Info ===== */}
      <div className="movie-details-container">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Image"
          }
          alt={movie.title}
          className="movie-details-poster"
        />

        <div className="movie-details-info">
          <h1 className="movie-details-title">{movie.title}</h1>

          <div className="movie-details-meta">
            <p>{movie.release_date?.slice(0, 4) || "N/A"}</p>
            <span className="dot">•</span>
            <p>{movie.runtime ? `${movie.runtime} min` : "N/A"}</p>
            <span className="dot">•</span>
            <p>{movie.vote_average?.toFixed(1) || "N/A"} ⭐</p>
          </div>

          <p className="movie-details-overview">
            {movie.overview || "No description available."}
          </p>

          {/* ⭐ OPEN RATING MODAL */}
          <button
            className="rate-movie-btn"
            onClick={() => setShowModal(true)}
          >
            Rate This Movie
          </button>

          {/* ❤️ Favorite Button */}
          <button
            className="favorite-btn"
            onClick={toggleFavorite}
            style={{
              background: "none",
              border: "none",
              fontSize: "32px",
              cursor: "pointer",
              marginTop: "12px",
            }}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      {/* ⭐ RATE MODAL */}
      {showModal && (
        <RateModal
          movie={movie}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRating}
        />
      )}
    </div>
  );
}

export default MovieDetails;
