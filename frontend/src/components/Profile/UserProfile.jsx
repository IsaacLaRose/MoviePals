import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

function UserProfile() {
  const { username } = useParams();

  const [user, setUser] = useState(null);            // user's info
  const [ratings, setRatings] = useState([]);        // movies they rated
  const [friends, setFriends] = useState([]);        // friends list
  const [followers, setFollowers] = useState([]);    // followers list (fake for now)
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 Get currently logged-in user
  const currentUserId = localStorage.getItem("userId");

  // ===============================
  // 1️⃣ Fetch User by Username
  // ===============================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.post("/api/getUserByUsername", { username });
        setUser(res.data);

        // After we know THEIR userId, fetch their ratings/friends
        fetchRatings(res.data.id);
        fetchFriends(res.data.id);

        // For now, followers is just empty (you have no API for it yet)
        setFollowers([]);

      } catch (e) {
        console.error("Error loading user:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  // ===============================
  // 2️⃣ Fetch Ratings from /api/getMoviesSeen
  // ===============================
  const fetchRatings = async (userId) => {
    try {
      const res = await axios.post("/api/getMoviesSeen", { userId });
      setRatings(res.data.movies || []);
    } catch (e) {
      console.error("Error loading ratings:", e);
    }
  };

  // ===============================
  // 3️⃣ Fetch Friends list
  // ===============================
  const fetchFriends = async (userId) => {
    try {
      const res = await axios.post("/api/viewFriendsList", { userId });
      setFriends(res.data.friendsList || []);

      // Check if CURRENT USER is friends with THIS USER
      if (currentUserId) {
        const isFriend = res.data.friendsList.some(f => f.friendsId === currentUserId);
        setIsFriend(isFriend);
      }

    } catch (e) {
      console.error("Error loading friends:", e);
    }
  };

  // ===============================
  // 4️⃣ Follow / Unfollow (local only for now)
  // ===============================
  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  // ===============================
  // 5️⃣ Add Friend (real backend)
  // ===============================
  const handleAddFriend = async () => {
    if (!currentUserId) {
      alert("Login required");
      return;
    }
    if (!isFollowing) {
      alert("Follow them before adding as a friend.");
      return;
    }

    try {
      await axios.post("/api/addFriend", {
        userId: currentUserId,
        friendsId: user.id,
      });

      setIsFriend(true);
      fetchFriends(user.id);
    } catch (e) {
      console.error(e);
      alert("Error adding friend");
    }
  };

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) return <div className="profile-page">Loading...</div>;
  if (!user) return <div className="profile-page">User not found.</div>;

  // ===============================
  // RENDER UI
  // ===============================
  return (
    <div className="profile-page">
      
      {/* HEADER */}
      <div className="profile-header-instagram">

        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-user-info">
          <h2 className="profile-username">{user.username}</h2>

          {/* ACTION BUTTONS */}
          <div className="profile-action-buttons">
            <button
              className="profile-follow-btn"
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>

            <button
              className="profile-addfriend-btn"
              onClick={handleAddFriend}
              disabled={!isFollowing || isFriend}
            >
              {isFriend ? "Friends ✓" : "Add Friend"}
            </button>
          </div>

          {/* STATS */}
          <div className="profile-stats-row">
            <div className="profile-stat-item pointer">
              <span className="stat-value">{ratings.length}</span>
              <span className="stat-label">Rated</span>
            </div>

            {/* FRIENDS COUNT */}
            <Link to={`/user/${username}/friends`} className="profile-stat-item pointer">
              <span className="stat-value">{friends.length}</span>
              <span className="stat-label">Friends</span>
            </Link>

            {/* FOLLOWERS (fake for now) */}
            <Link to={`/user/${username}/followers`} className="profile-stat-item pointer">
              <span className="stat-value">{followers.length}</span>
              <span className="stat-label">Followers</span>
            </Link>
          </div>

          <p className="profile-bio-box">{user.bio || "This user has no bio."}</p>
        </div>
      </div>

      {/* MOVIES */}
      <h3 className="profile-section-title">Their Ratings</h3>

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
