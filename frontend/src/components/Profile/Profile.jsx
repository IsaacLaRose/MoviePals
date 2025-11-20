import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Profile.css";

function Profile() {
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load real profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.post("/api/getUserProfile", { userId });

        // Backend returns:
        // { username, email, avatar, stats:{ratedCount,favoritesCount,friendsCount}, recentRatings:[] }

        setProfile(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) return <p className="profile-loading">Loading profile...</p>;

  if (!profile) return <p className="profile-error">Failed to load profile.</p>;

  const { username, email, avatar, stats, recentRatings } = profile;

  return (
    <div className="profile-page">

      {/* TOP HEADER */}
      <div className="profile-header">
        <img className="profile-avatar" src={avatar} alt={username} />
        <h1>{username}</h1>
        <p className="profile-email">{email}</p>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-box">
            <h2>{stats.ratedCount}</h2>
            <p>Movies Rated</p>
          </div>

          <div className="stat-box">
            <h2>{stats.favoritesCount}</h2>
            <p>Favorites</p>
          </div>

          <div className="stat-box">
            <h2>{stats.friendsCount}</h2>
            <p>Friends</p>
          </div>
        </div>
      </div>

      {/* RECENTLY RATED */}
      <div className="recent-section">
        <h2>Recently Rated</h2>

        {recentRatings.length === 0 && (
          <p className="no-recent">You haven't rated any movies yet.</p>
        )}

        <div className="recent-movie-grid">
          {recentRatings.map((movie) => (
            <div key={movie.tmdbId} className="recent-movie-card">
              <img
                src={movie.poster}
                alt={movie.title}
                className="recent-movie-poster"
              />
              <p className="recent-title">{movie.title}</p>
              <p className="recent-rating">{"★".repeat(movie.rating)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
