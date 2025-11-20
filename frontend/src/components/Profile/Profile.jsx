import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [user] = useState({
    username: "Ibrahim",
    friendsCount: 6,
    ratingsCount: 16,
    followers: 3,
    bio: "Movie lover 🎬 | Sci-Fi fan 🚀 | Orlando, FL 📍",
  });

  const [ratedMovies] = useState([
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

  return (
    <div className="profile-page">
      <div className="profile-header-instagram">

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar"></div>
        </div>

        <div className="profile-user-info">
          <h2 className="profile-username">{user.username}</h2>

          <button className="profile-addfriend-btn">Add Friend</button>

          <div className="profile-stats-row">
            <Link to="/ratings" className="profile-stat-item clickable">
              <span className="stat-value">{user.ratingsCount}</span>
              <span className="stat-label">Rated</span>
            </Link>

            <Link to="/friends" className="profile-stat-item clickable">
              <span className="stat-value">{user.friendsCount}</span>
              <span className="stat-label">Friends</span>
            </Link>

            <Link to="/followers" className="profile-stat-item clickable">
              <span className="stat-value">{user.followers}</span>
              <span className="stat-label">Followers</span>
            </Link>
          </div>

          <p className="profile-bio-box">{user.bio}</p>
        </div>

      </div>

      <h3 className="profile-section-title">Your Ratings</h3>

      <div className="profile-movie-grid">
        {ratedMovies.map((movie) => (
          <div key={movie.id} className="profile-movie-grid-item">
            <img src={movie.poster} alt={movie.title} />
          </div>
        ))}
      </div>

    </div>
  );
}

export default Profile;
