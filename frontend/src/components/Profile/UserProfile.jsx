import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "./Profile.css";

function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const profileRes = await api.post("/api/getUserProfile", { username });
      const foundUser = profileRes.data.user;

      setUser(foundUser);

      const resRatings = await api.post("/api/getMoviesSeen", {
        userId: foundUser._id,
      });
      setRatings(resRatings.data.movies || []);

      const resFriends = await api.post("/api/viewFriendsList", {
        userId: foundUser._id,
      });
      setFriends(resFriends.data.friendsList || []);

    } catch (err) {
      console.error("Error loading user profile:", err);
      setUser(null);
    }
  };

  if (!user) return <div className="profile-page">User not found.</div>;

  return (
    <div className="profile-page">
      <h1 className="profile-username">
        {user.firstName} {user.lastName}
      </h1>

      <div className="profile-stats-row">
        <div className="profile-stat-item">
          <span className="stat-value">{ratings.length}</span>
          <span className="stat-label">Rated</span>
        </div>

        <div className="profile-stat-item">
          <span className="stat-value">{friends.length}</span>
          <span className="stat-label">Friends</span>
        </div>

        <div className="profile-stat-item">
          <span className="stat-value">0</span>
          <span className="stat-label">Followers</span>
        </div>
      </div>

      <div className="profile-bio-box">
        {user.bio || "This user has no bio."}
      </div>

      <h2 className="profile-section-title">Ratings</h2>

      <div className="profile-movie-grid">
        {ratings.map((movie) => (
          <div key={movie.tmdbId} className="profile-movie-grid-item">
            <img src={movie.poster} alt={movie.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserProfile;
