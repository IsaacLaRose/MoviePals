import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (storedUser) {
      setUser(storedUser);
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const resRatings = await api.post("/api/getMoviesSeen", { userId });
      const allMovies = resRatings.data.movies || [];

      const sorted = allMovies.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.dateViewed) - new Date(a.dateViewed);
      });

      setRatings(sorted);

      const resFriends = await api.post("/api/viewFriendsList", { userId });
      setFriendsCount(resFriends.data.friendsList?.length || 0);
    } catch (err) {
      console.error("Error loading profile stats:", err);
    }
  };

  if (!user) return <div className="profile-page">Loading...</div>;

  return (
    <div className="profile-page">
      <h1 className="profile-username">
        {user.firstName} {user.lastName}
      </h1>

      <div className="profile-stats-row center-row">
        <div className="profile-stat-item">
          <span className="stat-value">{ratings.length}</span>
          <span className="stat-label">Rated</span>
        </div>

        <div className="profile-stat-item">
          <span className="stat-value">{friendsCount}</span>
          <span className="stat-label">Friends</span>
        </div>
      </div>

      <h2 className="profile-section-title">Your Top Ratings</h2>

      <div className="profile-movie-grid">
        {ratings.slice(0, 6).map((movie) => (
          <div key={movie.tmdbId} className="profile-movie-grid-item">
            <img src={movie.poster} alt={movie.title} />
            <div className="rating-stars">{movie.rating}★</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
