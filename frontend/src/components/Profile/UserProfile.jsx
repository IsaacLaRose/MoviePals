import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import "./Profile.css";

function UserProfile() {
  const { username } = useParams(); // <-- THIS IS THE ONLY PARAM!
  const [user, setUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      // CALL API WITH CORRECT FIELD
      const res = await api.post("/api/getUserProfileByUsername", {
        username: username
      });

      setUser(res.data);

      // Get ratings for that user
      const ratingsRes = await api.post("/api/getMoviesSeen", {
        userId: res.data.id
      });

      setRatings(ratingsRes.data.movies || []);

      // Load friend list
      const friendsRes = await api.post("/api/viewFriendsList", {
        userId: res.data.id
      });

      setFriends(friendsRes.data.friendsList || []);

    } catch (err) {
      console.error("Profile Load Error:", err);
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
