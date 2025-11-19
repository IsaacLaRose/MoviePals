import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MovieDetails.css";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(false);

  // 🔥 Fetch movie from TMDB (temporary until backend replaces this)
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=1dbb4c5340e375b5d60077d298651c2a`
        );
        const data = await res.json();

        // TMDB returns { success:false } for invalid IDs
        if (data.success === false) {
          setError(true);
        } else {
          setMovie(data);
        }
      } catch (err) {
        setError(true);
      }
    };

    fetchMovie();
  }, [id]);

  // 🔥 Movie not found
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

          <button className="rate-movie-btn">Rate This Movie</button>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
