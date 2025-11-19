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
    title: "Spider-Man: No Way Home",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  },
  {
    id: 4,
    title: "The Matrix",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    },
  {
    id: 5,
    title: "Joker",
    poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    id: 6,
    title: "The Wolf of Wall Street",
    poster: "https://image.tmdb.org/t/p/w500/pWHf4khOloNVfCxscsXFj3jj6gP.jpg",
  },
  {
    id: 7,
    title: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    rating: 5,
    comment: "A haunting portrait of a complicated genius."
  },

  {
    id: 8,
    title: "The Shawshank Redemption",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 5,
    comment: "Widely considered the greatest film ever made."
  },
  {
    id: 9,
    title: "Shutter Island",
    poster: "https://image.tmdb.org/t/p/w500/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg",
  }
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
