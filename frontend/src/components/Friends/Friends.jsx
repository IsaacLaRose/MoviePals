import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Friends.css";

function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFriendEmail, setNewFriendEmail] = useState("");

  const userId = localStorage.getItem("userId");

  // Load friends from backend
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await api.post("/api/viewFriendsList", { userId });

        // ✔ FIXED: backend returns *friendsList*, not *friends*
        const backendFriends = res.data.friendsList || [];

        const formatted = [];

        for (const friend of backendFriends) {
          const friendUserId = friend.friendsId; // backend stores userId of friend here

          // Fetch friend's rated movies
          const ratedRes = await api.post("/api/getMoviesSeen", {
            userId: friendUserId,
          });

          const movies = ratedRes.data.movies || [];

          formatted.push({
            friendsId: friendUserId,
            username: friend.username,
            email: friend.email,
            avatar:
              friend.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`,
            movies: movies.map((m) => ({
              id: m.tmdbId,
              title: m.title,
              poster: m.poster,
              rating: m.rating,
            })),
          });
        }

        setFriends(formatted);
      } catch (err) {
        console.error("Error loading friends:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [userId]);

  // Add a friend
  const addFriend = async () => {
    if (!newFriendEmail.trim()) return;

    try {
      await api.post("/api/addFriend", {
        userId,
        friendEmail: newFriendEmail.trim(),
      });

      // Reload friends list
      const res = await api.post("/api/viewFriendsList", { userId });

      // ✔ FIXED AGAIN: use friendsList
      const backendFriends = res.data.friendsList || [];

      const formatted = [];

      for (const friend of backendFriends) {
        const friendUserId = friend.friendsId;

        const ratedRes = await api.post("/api/getMoviesSeen", {
          userId: friendUserId,
        });

        formatted.push({
          friendsId: friendUserId,
          username: friend.username,
          email: friend.email,
          avatar:
            friend.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`,
          movies: ratedRes.data.movies.map((m) => ({
            id: m.tmdbId,
            title: m.title,
            poster: m.poster,
            rating: m.rating,
          })),
        });
      }

      setFriends(formatted);
      setNewFriendEmail(""); // clear input
    } catch (err) {
      console.error("Error adding friend:", err);
    }
  };

  if (loading) return <p className="friends-loading">Loading friends...</p>;

  return (
    <div className="friends-page">
      <h1 className="friends-title">Friends</h1>

      {/* Add Friend Input */}
      <div className="add-friend-box" style={{ marginBottom: "20px" }}>
        <input
          type="email"
          placeholder="Enter friend's email"
          value={newFriendEmail}
          onChange={(e) => setNewFriendEmail(e.target.value)}
          className="friend-input"
        />
        <button className="add-friend-btn" onClick={addFriend}>
          Add Friend
        </button>
      </div>

      {friends.length === 0 && (
        <p className="friends-empty">You haven't added any friends yet.</p>
      )}

      <div className="friends-list">
        {friends.map((friend) => (
          <Link
            key={friend.friendsId}
            to={`/user/${friend.username}`}
            className="friend-card-link"
          >
            <div className="friend-card">
              <div className="friend-header">
                <img
                  src={friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <h3 className="friend-name">{friend.username}</h3>
              </div>

              <div className="friend-movies">
                {friend.movies.length === 0 && (
                  <p className="no-rated-movies">No ratings yet</p>
                )}

                {friend.movies.slice(0, 6).map((movie) => (
                  <div key={movie.id} className="friend-movie">
                    <img src={movie.poster} alt={movie.title} />
                    <p className="friend-movie-title">{movie.title}</p>
                    <p className="friend-movie-rating">
                      {"★".repeat(movie.rating)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Friends;
